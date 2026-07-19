'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/adminAuth'
import { getAssignment } from '@/lib/course'
import { getRubric } from '@/lib/ai/rubrics'
import { evaluateWithRetry, toPlatformScore, RUBRIC_VERSION, type Evaluation } from '@/lib/ai/rubric-engine'
import { activeProvider, modelFor } from '@/lib/ai/provider'

export interface AiScoreState {
  error?: string
  result?: Evaluation
  scaled?: number
  platformMax?: number
  model?: string
}

export interface GradeState {
  error?: string
  success?: string
}

// ---- ИИ-оценка одной работы по её id (только преподаватель) ----
export async function scoreSubmissionById(_prev: AiScoreState, formData: FormData): Promise<AiScoreState> {
  if (!(await isAdmin())) return { error: 'Доступ только для преподавателя' }
  const id = String(formData.get('id') ?? '')

  const { data: sub } = await supabase
    .from('submissions')
    .select('assignment_key, content')
    .eq('id', id)
    .maybeSingle()
  if (!sub) return { error: 'Работа не найдена' }

  const rubric = getRubric(sub.assignment_key)
  if (!rubric) return { error: 'Для этого задания рубрика ИИ не настроена' }

  const text = ((sub.content ?? {}) as { text?: string }).text ?? ''
  if (text.trim().length < 5) return { error: 'Ответ слишком короткий' }

  const provider = activeProvider()
  const model = modelFor(provider)

  let outcome
  try {
    outcome = await evaluateWithRetry(rubric, text, provider, model)
  } catch (e) {
    return { error: `Ошибка ИИ: ${String(e)}` }
  }
  if ('skipped' in outcome && outcome.skipped) return { error: 'Ответ слишком короткий для оценивания' }

  const scaled = toPlatformScore(outcome.percent, rubric.platformMax)

  const { error: dbErr } = await supabase
    .from('submissions')
    .update({
      ai_score: { ...outcome, rubricVersion: RUBRIC_VERSION },
      ai_total: scaled,
      ai_evaluated_at: new Date().toISOString(),
      ai_model: model,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  revalidatePath(`/admin/submission/${id}`)

  return {
    result: outcome,
    scaled,
    platformMax: rubric.platformMax,
    model,
    error: dbErr ? `Оценка получена, но не сохранена: ${dbErr.message}` : undefined,
  }
}

// ---- Выставление официального балла преподавателем ----
export async function saveGrade(_prev: GradeState, formData: FormData): Promise<GradeState> {
  if (!(await isAdmin())) return { error: 'Доступ только для преподавателя' }

  const id = String(formData.get('id') ?? '')
  const assignmentKey = String(formData.get('assignment_key') ?? '')
  const feedback = String(formData.get('feedback') ?? '').trim()
  const raw = String(formData.get('score') ?? '').trim()

  const assignment = getAssignment(assignmentKey)
  const max = assignment?.points ?? 100
  const score = Math.round(Number(raw))
  if (raw === '' || Number.isNaN(score)) return { error: 'Укажите балл' }
  if (score < 0 || score > max) return { error: `Балл должен быть от 0 до ${max}` }

  const { error } = await supabase
    .from('submissions')
    .update({
      score,
      feedback,
      status: 'graded',
      graded_at: new Date().toISOString(),
      graded_by: 'teacher',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: `Не сохранено: ${error.message}` }

  revalidatePath(`/admin/submission/${id}`)
  revalidatePath('/admin')
  return { success: 'Балл сохранён' }
}
