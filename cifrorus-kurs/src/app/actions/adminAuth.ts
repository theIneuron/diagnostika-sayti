'use server'

import { redirect } from 'next/navigation'
import { setAdmin, clearAdmin } from '@/lib/adminAuth'

export async function loginAdmin(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const password = String(formData.get('password') ?? '')
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Неверный пароль' }
  }
  await setAdmin()
  redirect('/admin')
}

export async function logoutAdmin() {
  await clearAdmin()
  redirect('/admin/login')
}
