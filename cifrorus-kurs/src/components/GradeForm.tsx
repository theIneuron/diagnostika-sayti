'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { saveGrade, type GradeState } from '@/app/actions/grading'

const initial: GradeState = {}

export function GradeForm({
  submissionId,
  assignmentKey,
  maxPoints,
  initialScore,
  initialFeedback,
  aiSuggested,
}: {
  submissionId: string
  assignmentKey: string
  maxPoints: number
  initialScore: number | null
  initialFeedback: string | null
  aiSuggested?: number | null
}) {
  const [state, action, pending] = useActionState(saveGrade, initial)
  const [score, setScore] = useState(initialScore != null ? String(initialScore) : '')

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={submissionId} />
      <input type="hidden" name="assignment_key" value={assignmentKey} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Балл <span className="text-gray-400 font-normal">(0–{maxPoints})</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            name="score"
            type="number"
            min={0}
            max={maxPoints}
            value={score}
            onChange={e => setScore(e.target.value)}
            placeholder={`0–${maxPoints}`}
            className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          {aiSuggested != null && (
            <button
              type="button"
              onClick={() => setScore(String(aiSuggested))}
              className="text-xs text-violet-600 border border-violet-200 rounded-lg px-2.5 py-1.5 hover:bg-violet-50 transition-colors"
            >
              Взять балл ИИ → {aiSuggested}
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий студенту</label>
        <textarea
          name="feedback"
          defaultValue={initialFeedback ?? ''}
          rows={4}
          placeholder="Обратная связь по работе…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {state.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{state.error}</div>
      )}
      {state.success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
          {state.success}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60"
      >
        {pending ? 'Сохранение…' : 'Сохранить балл'}
      </button>
    </form>
  )
}
