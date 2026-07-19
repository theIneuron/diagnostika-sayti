'use client'

import { useActionState } from 'react'
import { createReview, type ReviewState } from '@/app/actions/reviews'

const initial: ReviewState = {}

export function ReviewForm({ targetSubmissionId }: { targetSubmissionId: string }) {
  const [state, action, pending] = useActionState(createReview, initial)
  const ta =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-500'

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="target_submission_id" value={targetSubmissionId} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Достоинства работы</label>
        <textarea name="strengths" rows={3} placeholder="Что удалось автору…" className={ta} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Недостатки / что улучшить</label>
        <textarea name="weaknesses" rows={3} placeholder="Слабые места…" className={ta} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Рекомендации</label>
        <textarea name="suggestions" rows={3} placeholder="Конкретные советы автору…" className={ta} />
      </div>

      {state.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{state.error}</div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60"
      >
        {pending ? 'Отправляем…' : 'Отправить рецензию'}
      </button>
      <p className="text-xs text-gray-400">
        Рецензия станет видна автору после одобрения преподавателем.
      </p>
    </form>
  )
}
