'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { getCurrentStudent } from '@/lib/auth'
import { getAssignment } from '@/lib/course'

export interface SubmissionState {
  error?: string
  success?: string
}

// Сохраняет ответ студента как черновик или отправляет на проверку.
// content хранится в jsonb: { text, link }. Одна запись на (student, задание).
async function upsert(
  key: string,
  formData: FormData,
  status: 'draft' | 'submitted',
): Promise<SubmissionState> {
  const student = await getCurrentStudent()
  if (!student) return { error: 'Сессия истекла — войдите заново' }

  const assignment = getAssignment(key)
  if (!assignment) return { error: 'Задание не найдено' }
  if (assignment.check === 'auto') return { error: 'Это тест — отправляется отдельно' }

  // Протокол ИИ-дневника (Модуль 3) или обычный текстовый ответ
  let content: Record<string, string>
  let filled: boolean
  if (assignment.kind === 'protocol') {
    const prompt = String(formData.get('prompt') ?? '').trim()
    const aiResponse = String(formData.get('ai_response') ?? '').trim()
    const rework = String(formData.get('rework') ?? '').trim()
    content = { prompt, ai_response: aiResponse, rework }
    filled = !!(prompt || aiResponse || rework)
  } else {
    const text = String(formData.get('text') ?? '').trim()
    const link = String(formData.get('link') ?? '').trim()
    content = { text, link }
    filled = !!(text || link)
  }

  if (status === 'submitted' && !filled) {
    return { error: 'Заполните ответ перед отправкой' }
  }

  const now = new Date().toISOString()
  const { error } = await supabase.from('submissions').upsert(
    {
      student_id: student.id,
      assignment_key: key,
      content,
      status,
      submitted_at: status === 'submitted' ? now : null,
      updated_at: now,
    },
    { onConflict: 'student_id,assignment_key' },
  )

  if (error) return { error: `Не удалось сохранить: ${error.message}` }

  revalidatePath(`/cabinet/task/${key}`)
  revalidatePath('/cabinet')
  return { success: status === 'submitted' ? 'Отправлено на проверку' : 'Черновик сохранён' }
}

// Единый обработчик формы: кнопка задаёт intent через name="intent"
// (значение нажатой кнопки попадает в formData).
export async function submitTask(_prev: SubmissionState, formData: FormData): Promise<SubmissionState> {
  const key = String(formData.get('key') ?? '')
  const status = formData.get('intent') === 'submit' ? 'submitted' : 'draft'
  return upsert(key, formData, status)
}
