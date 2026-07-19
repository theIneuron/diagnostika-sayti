'use server'

import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { hashPassword, verifyPassword, setSession, clearSession } from '@/lib/auth'
import { UNIVERSITIES } from '@/lib/course'

export interface AuthState {
  error?: string
}

// Нормализуем логин: строчные, без пробелов по краям
function normUsername(v: string): string {
  return v.trim().toLowerCase()
}

export async function registerStudent(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const username = normUsername(String(formData.get('username') ?? ''))
  const fullName = String(formData.get('full_name') ?? '').trim()
  const university = String(formData.get('university') ?? '').trim()
  const studyGroup = String(formData.get('study_group') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (username.length < 3) return { error: 'Логин должен быть не короче 3 символов' }
  if (!/^[a-z0-9_.]+$/.test(username)) return { error: 'Логин: только латиница, цифры, _ и .' }
  if (!fullName) return { error: 'Укажите ФИО' }
  if (!UNIVERSITIES.includes(university as (typeof UNIVERSITIES)[number]))
    return { error: 'Выберите вуз из списка' }
  if (!studyGroup) return { error: 'Укажите группу' }
  if (password.length < 6) return { error: 'Пароль должен быть не короче 6 символов' }

  // Уникальность логина
  const { data: existing } = await supabase
    .from('students')
    .select('id')
    .eq('username', username)
    .maybeSingle()
  if (existing) return { error: 'Такой логин уже занят' }

  const { data, error } = await supabase
    .from('students')
    .insert({
      username,
      full_name: fullName,
      university,
      study_group: studyGroup,
      password_hash: hashPassword(password),
    })
    .select('id')
    .single()

  if (error || !data) return { error: `Не удалось создать аккаунт: ${error?.message ?? 'ошибка'}` }

  await setSession(data.id)
  redirect('/cabinet')
}

export async function loginStudent(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const username = normUsername(String(formData.get('username') ?? ''))
  const password = String(formData.get('password') ?? '')
  if (!username || !password) return { error: 'Введите логин и пароль' }

  const { data } = await supabase
    .from('students')
    .select('id, password_hash')
    .eq('username', username)
    .maybeSingle()

  if (!data || !verifyPassword(password, data.password_hash)) {
    return { error: 'Неверный логин или пароль' }
  }

  await setSession(data.id)
  redirect('/cabinet')
}

export async function logoutStudent() {
  await clearSession()
  redirect('/')
}
