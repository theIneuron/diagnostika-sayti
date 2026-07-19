// ============================================================
// Обобщённый движок ИИ-оценивания по рубрике (перенесено и обобщено
// из «ДиагКомп-Рус»). Каждый критерий — 0–3 балла; максимум рубрики =
// число критериев × 3. Итог/процент/уровень пересчитываются на сервере.
//
// Отличие от «ДиагКомп-Рус»: движок НЕ знает конкретных рубрик —
// они описываются отдельно (rubrics.ts) для каждого задания курса.
// ============================================================

import { callModel, type AIProvider } from './provider'

export const RUBRIC_VERSION = 'v1-2026-07'

// Минимальная длина ответа для оценивания (пустые не отправляем в API)
export const MIN_ANSWER_LEN = 5

export interface RubricCriterion {
  name: string
  // Дескрипторы уровней: индексы = 0,1,2,3 балла
  descriptors: [string, string, string, string]
}

export interface Rubric {
  key: string
  label: string
  task: string
  criteria: RubricCriterion[]
  // Максимум ручной шкалы платформы для этого задания (например 20, 25).
  // Балл ИИ показывается в этой шкале: round(percent/100 × platformMax).
  platformMax: number
}

export interface CriterionResult {
  name: string
  score: number
  comment: string
}

export interface Evaluation {
  criteria: CriterionResult[]
  total: number // сумма по рубрике (0 … criteria.length×3)
  max: number // criteria.length × 3
  percent: number
  level: 'низкий' | 'средний' | 'высокий'
  feedback: string
}

export type Outcome =
  | { skipped: true; reason: string }
  | ({ skipped?: false } & Evaluation)

export function levelFromPercent(percent: number): Evaluation['level'] {
  if (percent >= 67) return 'высокий'
  if (percent >= 34) return 'средний'
  return 'низкий'
}

// Пересчёт рубрики (0–max) в шкалу платформы (0–platformMax) через процент
export function toPlatformScore(percent: number, platformMax: number): number {
  return Math.round((percent / 100) * platformMax)
}

export const SYSTEM_PROMPT =
  'Ты — эксперт по методике преподавания русского языка и цифровой дидактике. ' +
  'Оцени развёрнутый ответ студента СТРОГО по заданной рубрике: каждый критерий — целое число 0–3. ' +
  'Будь строгим и последовательным. Опирайся ТОЛЬКО на текст ответа, ничего не додумывай. ' +
  'Если ответ пустой или не по теме — ставь 0 по всем критериям. ' +
  'Для каждого критерия дай краткое (1 предложение) обоснование балла и общий feedback на 1–2 предложения.'

function renderRubric(rubric: Rubric): string {
  return rubric.criteria
    .map(c => {
      const desc = c.descriptors.map((d, s) => `      ${s} — ${d}`).join('\n')
      return `  Критерий «${c.name}»:\n${desc}`
    })
    .join('\n')
}

export function buildUserPrompt(rubric: Rubric, answer: string): string {
  const max = rubric.criteria.length * 3
  return [
    `[ЗАДАНИЕ]: ${rubric.task}`,
    '',
    `[РУБРИКА — ${rubric.label}]:`,
    renderRubric(rubric),
    '',
    `[МАКСИМУМ]: ${max} баллов (${rubric.criteria.length} критерия × 3).`,
    '',
    '[ФОРМАТ ОТВЕТА]: верни СТРОГО валидный JSON без markdown, вида:',
    '{"criteria":[{"name":"...","score":0-3,"comment":"..."}],"total":<сумма>,' +
      `"max":${max},"percent":<0-100>,"level":"низкий|средний|высокий","feedback":"..."}`,
    '',
    '[ОТВЕТ СТУДЕНТА]:',
    answer,
  ].join('\n')
}

// JSON Schema для structured outputs (гарантирует разбираемый ответ у Anthropic)
export const EVAL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    criteria: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          score: { type: 'integer', enum: [0, 1, 2, 3] },
          comment: { type: 'string' },
        },
        required: ['name', 'score', 'comment'],
      },
    },
    total: { type: 'integer' },
    max: { type: 'integer' },
    percent: { type: 'integer' },
    level: { type: 'string', enum: ['низкий', 'средний', 'высокий'] },
    feedback: { type: 'string' },
  },
  required: ['criteria', 'total', 'max', 'percent', 'level', 'feedback'],
} as const

// Извлекает JSON даже если модель обернула его в markdown-блок
function parseJson(text: string): Evaluation {
  const cleaned = text.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(cleaned) as Evaluation
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0]) as Evaluation
    throw new Error('Не удалось разобрать JSON ответа модели')
  }
}

// Оценивает один открытый ответ по рубрике. total/percent/level
// пересчитываются на сервере для защиты от «фантазий» модели.
export async function evaluateAnswer(
  rubric: Rubric,
  answer: string,
  provider: AIProvider,
  model: string,
): Promise<Outcome> {
  const text = (answer ?? '').trim()
  if (text.length < MIN_ANSWER_LEN) return { skipped: true, reason: 'empty' }

  const raw = await callModel(
    provider,
    model,
    SYSTEM_PROMPT,
    buildUserPrompt(rubric, text),
    EVAL_SCHEMA as unknown as Record<string, unknown>,
  )
  const parsed = parseJson(raw)

  const criteria: CriterionResult[] = (parsed.criteria ?? []).map(c => ({
    name: String(c.name ?? ''),
    score: Math.min(3, Math.max(0, Math.round(Number(c.score) || 0))),
    comment: String(c.comment ?? ''),
  }))
  const max = rubric.criteria.length * 3
  const total = Math.min(max, criteria.reduce((s, c) => s + c.score, 0))
  const percent = max > 0 ? Math.round((total / max) * 100) : 0

  return {
    criteria,
    total,
    max,
    percent,
    level: levelFromPercent(percent),
    feedback: String(parsed.feedback ?? ''),
  }
}

// Одна повторная попытка при сбое парсинга/сети
export async function evaluateWithRetry(
  rubric: Rubric,
  answer: string,
  provider: AIProvider,
  model: string,
): Promise<Outcome> {
  try {
    return await evaluateAnswer(rubric, answer, provider, model)
  } catch {
    return await evaluateAnswer(rubric, answer, provider, model)
  }
}
