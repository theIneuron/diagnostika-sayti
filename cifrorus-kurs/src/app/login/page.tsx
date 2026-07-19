'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { loginStudent, type AuthState } from '@/app/actions/auth'

const initial: AuthState = {}

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10'

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginStudent, initial)

  return (
    <main className="relative flex-1 flex items-center justify-center px-6 py-12 overflow-hidden">
      {/* Декоративные пятна */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-violet-300/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-indigo-300/25 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 17 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-bold text-xl text-gray-900 tracking-tight">
            ЦифроРус<span className="text-gradient">-Курс</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">С возвращением</h1>
          <p className="mt-1 text-sm text-gray-500">Войдите в личный кабинет курса</p>
        </div>

        <div className="card p-7">
          <form action={action} className="space-y-4">
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1.5">Логин</span>
              <input name="username" required autoComplete="username" className={inputCls} placeholder="ivan.petrov" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1.5">Пароль</span>
              <input name="password" type="password" required autoComplete="current-password" className={inputCls} placeholder="••••••" />
            </label>

            {state.error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600"
              >
                {state.error}
              </motion.div>
            )}

            <button type="submit" disabled={pending} className="btn-primary w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
              {pending ? 'Входим…' : 'Войти'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-violet-600 font-semibold hover:text-violet-800 transition-colors">
            Регистрация
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
