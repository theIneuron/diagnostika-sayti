// ============================================================
// Аутентификация преподавателя (панель /admin). Простая cookie-схема
// на общий ADMIN_PASSWORD (как в «ДиагКомп-Рус»).
// ============================================================

import 'server-only'
import { cookies } from 'next/headers'

const COOKIE = 'admin_auth'

function token(): string {
  return Buffer.from(process.env.ADMIN_PASSWORD ?? '').toString('base64')
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies()
  const v = store.get(COOKIE)?.value
  return !!process.env.ADMIN_PASSWORD && v === token()
}

export async function setAdmin() {
  const store = await cookies()
  store.set(COOKIE, token(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function clearAdmin() {
  const store = await cookies()
  store.delete(COOKIE)
}
