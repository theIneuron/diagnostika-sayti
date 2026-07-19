'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentStudent } from '@/lib/auth'
import { isAdmin } from '@/lib/adminAuth'

export interface ReviewState {
  error?: string
}

// Студент пишет рецензию на работу сокурсника (структурированная форма).
export async function createReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const student = await getCurrentStudent()
  if (!student) return { error: 'Сессия истекла — войдите заново' }

  const targetId = String(formData.get('target_submission_id') ?? '')
  const strengths = String(formData.get('strengths') ?? '').trim()
  const weaknesses = String(formData.get('weaknesses') ?? '').trim()
  const suggestions = String(formData.get('suggestions') ?? '').trim()

  if (!targetId) return { error: 'Работа не найдена' }
  if (strengths.length < 5 && weaknesses.length < 5 && suggestions.length < 5) {
    return { error: 'Заполните хотя бы один раздел рецензии' }
  }

  // Нельзя рецензировать свою работу
  const { data: target } = await supabase
    .from('submissions')
    .select('student_id')
    .eq('id', targetId)
    .maybeSingle()
  if (!target) return { error: 'Работа не найдена' }
  if (target.student_id === student.id) return { error: 'Нельзя рецензировать свою работу' }

  // Одна рецензия на работу от одного студента
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('reviewer_id', student.id)
    .eq('target_submission_id', targetId)
    .maybeSingle()
  if (existing) return { error: 'Вы уже рецензировали эту работу' }

  const { error } = await supabase.from('reviews').insert({
    reviewer_id: student.id,
    target_submission_id: targetId,
    content: { strengths, weaknesses, suggestions },
    approved: false,
  })
  if (error) return { error: `Не удалось сохранить рецензию: ${error.message}` }

  redirect('/cabinet/review')
}

// Преподаватель одобряет рецензию — после этого её видит автор работы.
export async function approveReview(formData: FormData) {
  if (!(await isAdmin())) return
  const id = String(formData.get('review_id') ?? '')
  const submissionId = String(formData.get('submission_id') ?? '')
  await supabase.from('reviews').update({ approved: true }).eq('id', id)
  if (submissionId) revalidatePath(`/admin/submission/${submissionId}`)
}
