import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenAI } from '@google/genai'
import { revalidatePath } from 'next/cache'
import {
  SYSTEM_PROMPT,
  RUBRIC_B,
  RUBRIC_C,
  EVAL_SCHEMA,
  RUBRIC_VERSION,
  MAX_PER_PART,
  activeProvider,
  modelFor,
  buildUserPrompt,
  levelFromPercent,
  type AIProvider,
  type PartRubric,
  type PartEvaluation,
  type CriterionResult,
} from '@/lib/rubrics'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Клиенты создаём лениво — нужен только выбранный провайдер
let _anthropic: Anthropic | null = null
function anthropicClient() {
  return (_anthropic ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }))
}
let _genai: GoogleGenAI | null = null
function genaiClient() {
  return (_genai ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }))
}

// Минимальная длина ответа для оценивания (ТЗ §9: пустые ответы не отправляем в API)
const MIN_ANSWER_LEN = 5

type PartOutcome =
  | { skipped: true; reason: string }
  | ({ skipped?: false } & PartEvaluation)

// Возвращает сырой JSON-текст оценки от выбранной модели
async function callModel(
  provider: AIProvider,
  model: string,
  userPrompt: string,
): Promise<string> {
  if (provider === 'gemini') {
    const resp = await genaiClient().models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0,
        thinkingConfig: { thinkingBudget: 0 }, // оценивание — не творческая задача
      },
    })
    return resp.text ?? ''
  }

  // Anthropic / Claude
  const message = await anthropicClient().messages.create({
    model,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    thinking: { type: 'disabled' },
    output_config: { format: { type: 'json_schema', schema: EVAL_SCHEMA } },
    messages: [{ role: 'user', content: userPrompt }],
  })
  const raw = message.content.find(b => b.type === 'text')
  return raw && raw.type === 'text' ? raw.text : ''
}

// Извлекает JSON даже если модель обернула его в markdown-блок
function parseJson(text: string): PartEvaluation {
  const cleaned = text.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(cleaned) as PartEvaluation
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0]) as PartEvaluation
    throw new Error('Не удалось разобрать JSON ответа модели')
  }
}

// Оценивает один открытый ответ по рубрике. total/percent/level пересчитываются
// на сервере для консистентности и защиты от «фантазий» модели.
async function evaluatePart(
  rubric: PartRubric,
  answer: string,
  provider: AIProvider,
  model: string,
): Promise<PartOutcome> {
  const text = (answer ?? '').trim()
  if (text.length < MIN_ANSWER_LEN) return { skipped: true, reason: 'empty' }

  const rawText = await callModel(provider, model, buildUserPrompt(rubric, text))
  const parsed = parseJson(rawText)

  const criteria: CriterionResult[] = (parsed.criteria ?? []).map(c => ({
    name: String(c.name ?? ''),
    score: Math.min(3, Math.max(0, Math.round(Number(c.score) || 0))),
    comment: String(c.comment ?? ''),
  }))
  const max = Number(parsed.max) === 9 ? 9 : MAX_PER_PART
  const counted = max === 9 ? criteria.slice(0, 3) : criteria
  const total = Math.min(max, counted.reduce((s, c) => s + c.score, 0))
  const percent = Math.round((total / max) * 100)

  return {
    criteria,
    total,
    max,
    percent,
    level: levelFromPercent(percent),
    feedback: String(parsed.feedback ?? ''),
  }
}

// Одна повторная попытка при сбое парсинга/сети (ТЗ §9)
async function evaluateWithRetry(
  rubric: PartRubric,
  answer: string,
  provider: AIProvider,
  model: string,
): Promise<PartOutcome> {
  try {
    return await evaluatePart(rubric, answer, provider, model)
  } catch {
    return await evaluatePart(rubric, answer, provider, model)
  }
}

export async function POST(request: NextRequest) {
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data: r } = await supabase
    .from('respondents')
    .select('part_b_answer, part_c_justification')
    .eq('id', id)
    .single()

  if (!r) return NextResponse.json({ error: 'Respondent not found' }, { status: 404 })

  const partBText = r.part_b_answer ?? ''
  const partCText = r.part_c_justification ?? ''
  if (!partBText.trim() && !partCText.trim()) {
    return NextResponse.json({ error: 'Ответы не найдены' }, { status: 400 })
  }

  const provider = activeProvider()
  const model = modelFor(provider)

  let partB: PartOutcome
  let partC: PartOutcome
  try {
    ;[partB, partC] = await Promise.all([
      evaluateWithRetry(RUBRIC_B, partBText, provider, model),
      evaluateWithRetry(RUBRIC_C, partCText, provider, model),
    ])
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }

  // Сохраняем в БД: полный JSON + сумма + метаданные (ТЗ §8, §9)
  const { error: dbError } = await supabase
    .from('respondents')
    .update({
      ai_score_b: 'skipped' in partB && partB.skipped ? null : partB,
      ai_score_c: 'skipped' in partC && partC.skipped ? null : partC,
      ai_total_b: 'skipped' in partB && partB.skipped ? null : partB.total,
      ai_total_c: 'skipped' in partC && partC.skipped ? null : partC.total,
      ai_evaluated_at: new Date().toISOString(),
      ai_model: model,
      ai_rubric_version: RUBRIC_VERSION,
    })
    .eq('id', id)

  if (dbError) {
    return NextResponse.json({ partB, partC, warning: `Не сохранено в БД: ${dbError.message}` })
  }

  revalidatePath(`/admin/respondents/${id}`)
  return NextResponse.json({ partB, partC, model, provider, rubricVersion: RUBRIC_VERSION })
}
