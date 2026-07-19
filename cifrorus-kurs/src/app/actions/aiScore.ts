'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { getCurrentStudent } from '@/lib/auth'
import { getRubric } from '@/lib/ai/rubrics'
import { evaluateWithRetry, toPlatformScore, RUBRIC_VERSION, type Evaluation } from '@/lib/ai/rubric-engine'
import { activeProvider, modelFor } from '@/lib/ai/provider'

export interface AiScoreState {
  error?: string
  result?: Evaluation // оценка по рубрике (0…max)
  scaled?: number // балл в шкале платформы (0…platformMax)
  platformMax?: number
  model?: string
}

// Оценивает открытый ответ студента по рубрике задания через ИИ и
// сохраняет результат в submissions (ai_score / ai_total / метаданные).
export async function scoreSubmission(_prev: AiScoreState, formData: FormData): Promise<AiScoreState> {
  const key = String(formData.get('key') ?? '')

  const student = await getCurrentStudent()
  if (!student) return { error: 'Сессия истекла — войдите заново' }

  const rubric = getRubric(key)
  if (!rubric) return { error: 'Для этого задания рубрика ИИ пока не настроена' }

  const { data: sub } = await supabase
    .from('submissions')
    .select('content')
    .eq('student_id', student.id)
    .eq('assignment_key', key)
    .maybeSingle()

  const text = ((sub?.content ?? {}) as { text?: string }).text ?? ''
  if (text.trim().length < 5) return { error: 'Сначала напишите и сохраните ответ' }

  const provider = activeProvider()
  const model = modelFor(provider)

  let outcome
  try {
    outcome = await evaluateWithRetry(rubric, text, provider, model)
  } catch (e) {
    return { error: `Ошибка ИИ: ${String(e)}` }
  }
  if ('skipped' in outcome && outcome.skipped) {
    return { error: 'Ответ слишком короткий для оценивания' }
  }

  const scaled = toPlatformScore(outcome.percent, rubric.platformMax)

  const { error: dbErr } = await supabase
    .from('submissions')
    .update({
      // rubricVersion кладём внутрь jsonb — отдельной колонки нет
      ai_score: { ...outcome, rubricVersion: RUBRIC_VERSION },
      ai_total: scaled, // храним уже в шкале платформы задания
      ai_evaluated_at: new Date().toISOString(),
      ai_model: model,
      updated_at: new Date().toISOString(),
    })
    .eq('student_id', student.id)
    .eq('assignment_key', key)

  revalidatePath(`/cabinet/task/${key}`)

  return {
    result: outcome,
    scaled,
    platformMax: rubric.platformMax,
    model,
    error: dbErr ? `Оценка получена, но не сохранена: ${dbErr.message}` : undefined,
  }
}
