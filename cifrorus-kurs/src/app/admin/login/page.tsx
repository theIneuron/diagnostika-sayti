'use client'

import { useActionState } from 'react'
import { loginAdmin } from '@/app/actions/adminAuth'

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(loginAdmin, null)

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Панель преподавателя</h1>
        <p className="mt-1 text-sm text-gray-500 text-center">«ЦифроРус-Курс»</p>

        <form action={action} className="mt-8 space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Пароль</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="••••••"
            />
          </label>

          {state?.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{state.error}</div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {pending ? 'Входим…' : 'Войти'}
          </button>
        </form>
      </div>
    </main>
  )
}
