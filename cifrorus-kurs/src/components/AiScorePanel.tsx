'use client'

import { useActionState } from 'react'
import { scoreSubmissionById, type AiScoreState } from '@/app/actions/grading'
import type { Evaluation } from '@/lib/ai/rubric-engine'

const LEVEL_COLOR: Record<string, string> = {
  высокий: 'text-green-600',
  средний: 'text-yellow-600',
  низкий: 'text-red-500',
}

export function AiScorePanel({
  submissionId,
  platformMax,
  savedEval,
  savedScaled,
  model,
}: {
  submissionId: string
  platformMax: number
  savedEval?: Evaluation | null
  savedScaled?: number | null
  model?: string | null
}) {
  const [state, action, pending] = useActionState(scoreSubmissionById, {} as AiScoreState)

  const evalResult = state.result ?? savedEval ?? null
  const scaled = state.scaled ?? savedScaled ?? null
  const usedModel = state.model ?? model ?? null

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-violet-800">Подсказка ИИ по рубрике</p>
        <form action={action}>
          <input type="hidden" name="id" value={submissionId} />
          <button
            type="submit"
            disabled={pending}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60"
          >
            {pending ? 'ИИ анализирует…' : evalResult ? 'Оценить заново' : 'Оценить с помощью ИИ'}
          </button>
        </form>
      </div>

      {state.error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2 mb-3">{state.error}</p>
      )}

      {!evalResult ? (
        <p className="text-xs text-violet-400">
          ИИ оценит ответ по рубрике (4 критерия × 0–3) и переведёт в шкалу задания (0–{platformMax}).
          Это подсказка эксперту — итоговый балл ставите вы.
        </p>
      ) : (
        <div className="bg-white rounded-xl border border-violet-100 p-4">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-violet-700">{scaled}</span>
            <span className="text-xs text-gray-400">/ {platformMax}</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-violet-100 text-violet-700">
              {evalResult.percent}%
            </span>
            <span className={`text-xs font-semibold ml-auto ${LEVEL_COLOR[evalResult.level] ?? 'text-gray-500'}`}>
              {evalResult.level}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">
            По рубрике: {evalResult.total} / {evalResult.max}
            {usedModel && <> · {usedModel}</>}
          </p>
          <ul className="space-y-1.5 mb-2">
            {evalResult.criteria.map((c, i) => (
              <li key={i} className="text-xs flex items-start gap-1.5">
                <span className="font-bold text-violet-700 shrink-0 w-4">{c.score}</span>
                <div>
                  <span className="font-medium text-gray-700">{c.name}</span>
                  {c.comment && <span className="text-gray-500"> — {c.comment}</span>}
                </div>
              </li>
            ))}
          </ul>
          {evalResult.feedback && (
            <p className="text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-2 italic">
              {evalResult.feedback}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
