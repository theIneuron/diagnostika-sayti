'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginStudent, type AuthState } from '@/app/actions/auth'

const initial: AuthState = {}

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginStudent, initial)

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Вход</h1>
        <p className="mt-1 text-sm text-gray-500 text-center">Личный кабинет курса «ЦифроРус-Курс»</p>

        <form action={action} className="mt-8 space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Логин</span>
            <input name="username" required autoComplete="username"
              className="input" placeholder="ivan.petrov" />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Пароль</span>
            <input name="password" type="password" required autoComplete="current-password"
              className="input" placeholder="••••••" />
          </label>

          {state.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {state.error}
            </div>
          )}

          <button type="submit" disabled={pending}
            className="w-full py-3 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-60">
            {pending ? 'Входим…' : 'Войти'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-violet-600 font-medium hover:underline">Регистрация</Link>
        </p>
      </div>

      <style>{`
        .input { width:100%; border:1px solid #d1d5db; border-radius:0.6rem; padding:0.6rem 0.75rem; font-size:0.875rem; outline:none; }
        .input:focus { box-shadow:0 0 0 2px #8b5cf6; border-color:transparent; }
      `}</style>
    </main>
  )
}
