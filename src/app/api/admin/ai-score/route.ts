import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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

  if (!partBText && !partCText) {
    return NextResponse.json({ error: 'Ответы не найдены' }, { status: 400 })
  }

  const prompt = `Ты — эксперт-оценщик цифровой компетентности будущих учителей русского языка. Оцени ответы студента строго по приведённым рубрикам.

## ЧАСТЬ Б — Применение знаний (0–30 баллов)
Задание: предложить конкретные цифровые инструменты для решения педагогической задачи и обосновать их.

Рубрика:
- 0–10 баллов: инструменты не упомянуты или нерелевантны задаче
- 11–20 баллов: упомянуто 1–2 релевантных инструмента, обоснование неполное
- 21–30 баллов: 3+ релевантных инструмента, каждый аргументирован

Ответ студента (Часть Б):
"""
${partBText || '(ответ не предоставлен)'}
"""

## ЧАСТЬ В — Практическое задание (0–50 баллов)
Задание: разработать или описать цифровой урок/задание с применением цифровых инструментов.

Рубрика:
- 0–15 баллов: задание не представлено или полностью не соответствует требованиям
- 16–30 баллов: выполнено частично, обоснование слабое или поверхностное
- 31–40 баллов: требования выполнены, обоснование достаточное
- 41–50 баллов: выполнено полностью, с подробным и точным обоснованием

Ответ студента (Часть В):
"""
${partCText || '(ответ не предоставлен)'}
"""

Верни результат ТОЛЬКО в формате JSON, без лишнего текста:
{
  "partB": {
    "score": <целое число 0–30>,
    "explanation": "<1–2 предложения: почему именно такой балл>"
  },
  "partC": {
    "score": <целое число 0–50>,
    "explanation": "<1–2 предложения: почему именно такой балл>"
  }
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Claude did not return valid JSON')

    const result = JSON.parse(jsonMatch[0])

    // Clamp scores to valid ranges
    result.partB.score = Math.min(30, Math.max(0, Math.round(result.partB.score)))
    result.partC.score = Math.min(50, Math.max(0, Math.round(result.partC.score)))

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
