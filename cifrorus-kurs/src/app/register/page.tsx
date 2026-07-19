'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { registerStudent, type AuthState } from '@/app/actions/auth'
import { UNIVERSITIES } from '@/lib/course'

const initial: AuthState = {}

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10'

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerStudent, initial)

  return (
    <main className="relative flex-1 flex items-center justify-center px-6 py-12 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-300/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan-300/20 blur-3xl" />

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
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Создайте аккаунт</h1>
          <p className="mt-1 text-sm text-gray-500">Личный кабинет курса — за минуту</p>
        </div>

        <div className="card p-7">
          <form action={action} className="space-y-4">
            <Field label="Логин" hint="латиница, цифры, _ .">
              <input name="username" required autoComplete="username" className={inputCls} placeholder="ivan.petrov" />
            </Field>
            <Field label="ФИО">
              <input name="full_name" required className={inputCls} placeholder="Иванов Иван Иванович" />
            </Field>
            <Field label="Вуз">
              <select name="university" required defaultValue="" className={inputCls}>
                <option value="" disabled>Выберите вуз…</option>
                {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Группа">
              <input name="study_group" required className={inputCls} placeholder="РЯ-21" />
            </Field>
            <Field label="Пароль" hint="не короче 6 символов">
              <input name="password" type="password" required autoComplete="new-password" className={inputCls} placeholder="••••••" />
            </Field>

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
              {pending ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-violet-600 font-semibold hover:text-violet-800 transition-colors">
            Войти
          </Link>
        </p>
      </motion.div>
    </main>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {hint && <span className="text-gray-400 font-normal"> — {hint}</span>}
      </span>
      {children}
    </label>
  )
}
