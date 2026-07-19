// ============================================================
// Аутентификация студентов: хеширование пароля (Node scrypt) и сессия
// через httpOnly-cookie (хранится student_id). Всё выполняется ТОЛЬКО
// на сервере (server actions / server components).
// ============================================================

import 'server-only'
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { supabase } from './supabase'

const SESSION_COOKIE = 'student_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 дней

// ---- Пароль ----
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const expected = Buffer.from(hash, 'hex')
  const actual = scryptSync(password, salt, 64)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

// ---- Сессия ----
export async function setSession(studentId: string) {
  const store = await cookies()
  store.set(SESSION_COOKIE, studentId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

export async function clearSession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export interface Student {
  id: string
  username: string
  full_name: string
  university: string
  study_group: string
  role: string
}

// Текущий студент по cookie (или null). Проверяет существование в БД.
export async function getCurrentStudent(): Promise<Student | null> {
  const store = await cookies()
  const id = store.get(SESSION_COOKIE)?.value
  if (!id) return null

  const { data, error } = await supabase
    .from('students')
    .select('id, username, full_name, university, study_group, role')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Student
}
