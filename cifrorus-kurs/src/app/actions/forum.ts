'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { getCurrentStudent } from '@/lib/auth'

export interface ForumState {
  error?: string
  success?: boolean
}

export async function createPost(_prev: ForumState, formData: FormData): Promise<ForumState> {
  const student = await getCurrentStudent()
  if (!student) return { error: 'Сессия истекла — войдите заново' }

  const topic = String(formData.get('topic') ?? '').trim()
  const body = String(formData.get('body') ?? '').trim()
  if (body.length < 10) return { error: 'Пост слишком короткий' }

  const { error } = await supabase.from('forum_posts').insert({
    student_id: student.id,
    topic: topic || null,
    body,
  })
  if (error) return { error: `Не удалось опубликовать: ${error.message}` }

  revalidatePath('/cabinet/forum')
  return { success: true }
}

export async function createReply(_prev: ForumState, formData: FormData): Promise<ForumState> {
  const student = await getCurrentStudent()
  if (!student) return { error: 'Сессия истекла — войдите заново' }

  const postId = String(formData.get('post_id') ?? '')
  const body = String(formData.get('body') ?? '').trim()
  if (!postId) return { error: 'Пост не найден' }
  if (body.length < 5) return { error: 'Ответ слишком короткий' }

  const { error } = await supabase.from('forum_replies').insert({
    post_id: postId,
    student_id: student.id,
    body,
  })
  if (error) return { error: `Не удалось ответить: ${error.message}` }

  revalidatePath('/cabinet/forum')
  return { success: true }
}
