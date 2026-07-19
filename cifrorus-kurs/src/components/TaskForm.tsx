'use client'

import { useActionState } from 'react'
import { submitTask, type SubmissionState } from '@/app/actions/submissions'

const initial: SubmissionState = {}

export function TaskForm({
  assignmentKey,
  text,
  link,
  status,
  needsLink,
}: {
  assignmentKey: string
  text: string
  link: string
  status: string | null
  needsLink?: boolean
}) {
  const [state, action, pending] = useActionState(submitTask, initial)
  const graded = status === 'graded'

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="key" value={assignmentKey} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ваш ответ</label>
        <textarea
          name="text"
          defaultValue={text}
          rows={10}
          disabled={graded}
          placeholder="Введите ответ на задание…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      {needsLink && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ссылка <span className="text-gray-400 font-normal">(на файл / курс / документ)</span>
          </label>
          <input
            name="link"
            type="url"
            defaultValue={link}
            disabled={graded}
            placeholder="https://…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
      )}

      {state.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{state.error}</div>
      )}
      {state.success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
          {state.success}
        </div>
      )}

      {graded ? (
        <p className="text-sm text-gray-400 italic">Работа оценена — редактирование недоступно.</p>
      ) : (
        <div className="flex items-center gap-3">
          <button
            type="submit"
            name="intent"
            value="draft"
            disabled={pending}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {pending ? 'Сохранение…' : 'Сохранить черновик'}
          </button>
          <button
            type="submit"
            name="intent"
            value="submit"
            disabled={pending}
            className="px-5 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60"
          >
            Отправить на проверку
          </button>
        </div>
      )}
    </form>
  )
}
