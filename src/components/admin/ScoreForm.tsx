'use client'

import { useState, useActionState } from 'react'
import { scoreRespondent, type ScoreState } from '@/app/actions/scoreRespondent'

const initial: ScoreState = {}

interface AISuggestion {
  partB: { score: number; explanation: string }
  partC: { score: number; explanation: string }
}

export function ScoreForm({
  id,
  partBScore,
  partCScore,
  totalScore,
  level,
}: {
  id: string
  partBScore: number | null
  partCScore: number | null
  totalScore: number | null
  level: string | null
}) {
  const [state, action, pending] = useActionState(scoreRespondent, initial)
  const [partB, setPartB] = useState<string>(partBScore != null ? String(partBScore) : '')
  const [partC, setPartC] = useState<string>(partCScore != null ? String(partCScore) : '')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  async function handleAIScore() {
    setAiLoading(true)
    setAiError(null)
    setAiSuggestion(null)
    try {
      const res = await fetch('/api/admin/ai-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setAiError(data.error ?? 'Ошибка ИИ')
      } else {
        setAiSuggestion(data)
      }
    } catch (e) {
      setAiError(String(e))
    } finally {
      setAiLoading(false)
    }
  }

  function acceptAI() {
    if (!aiSuggestion) return
    setPartB(String(aiSuggestion.partB.score))
    setPartC(String(aiSuggestion.partC.score))
  }

  return (
    <div className="space-y-4">
      {/* Rubrikalar */}
      <div className="grid grid-cols-2 gap-4">
        <details className="group">
          <summary className="cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-800 select-none list-none flex items-center gap-1 mb-2">
            <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
            Рубрика части Б (0–30)
          </summary>
          <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 space-y-1.5 mb-2 border border-gray-200">
            <div className="flex gap-2"><span className="font-semibold text-orange-600 w-12 shrink-0">0–10</span><span>Цифровые инструменты не упомянуты или не имеют отношения к теме</span></div>
            <div className="flex gap-2"><span className="font-semibold text-yellow-600 w-12 shrink-0">11–20</span><span>Упомянуто 1–2 релевантных инструмента, обоснование недостаточное</span></div>
            <div className="flex gap-2"><span className="font-semibold text-green-600 w-12 shrink-0">21–30</span><span>3+ релевантных инструмента, каждый обоснован</span></div>
          </div>
        </details>

        <details className="group">
          <summary className="cursor-pointer text-xs font-medium text-teal-600 hover:text-teal-800 select-none list-none flex items-center gap-1 mb-2">
            <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
            Рубрика части В (0–50)
          </summary>
          <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 space-y-1.5 mb-2 border border-gray-200">
            <div className="flex gap-2"><span className="font-semibold text-orange-600 w-12 shrink-0">0–15</span><span>Задание не представлено или полностью не соответствует требованиям</span></div>
            <div className="flex gap-2"><span className="font-semibold text-yellow-600 w-12 shrink-0">16–30</span><span>Выполнено частично, обоснование слабое или поверхностное</span></div>
            <div className="flex gap-2"><span className="font-semibold text-blue-600 w-12 shrink-0">31–40</span><span>Требования выполнены, обоснование достаточное</span></div>
            <div className="flex gap-2"><span className="font-semibold text-green-600 w-12 shrink-0">41–50</span><span>Выполнено полностью, с подробным и точным обоснованием</span></div>
          </div>
        </details>
      </div>

      {/* AI Score Button */}
      <div>
        <button
          type="button"
          onClick={handleAIScore}
          disabled={aiLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {aiLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              ИИ анализирует...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Оценить с помощью ИИ
            </>
          )}
        </button>
        <p className="text-xs text-gray-400 mt-1">Claude оценит ответы и предложит баллы — вы можете принять или изменить</p>
      </div>

      {/* AI Error */}
      {aiError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <strong>Ошибка ИИ:</strong> {aiError}
        </div>
      )}

      {/* AI Suggestion Panel */}
      {aiSuggestion && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-violet-800">Предложение ИИ (Claude)</p>
            <button
              type="button"
              onClick={acceptAI}
              className="px-3 py-1 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
            >
              Принять оба балла
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border border-violet-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-violet-600 font-medium">Часть Б</span>
                <span className="text-lg font-bold text-violet-700">{aiSuggestion.partB.score}<span className="text-xs font-normal text-gray-400">/30</span></span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{aiSuggestion.partB.explanation}</p>
              <button
                type="button"
                onClick={() => setPartB(String(aiSuggestion.partB.score))}
                className="mt-2 text-xs text-violet-600 hover:text-violet-800 underline"
              >
                Принять только Б
              </button>
            </div>
            <div className="bg-white rounded-lg p-3 border border-violet-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-teal-600 font-medium">Часть В</span>
                <span className="text-lg font-bold text-teal-700">{aiSuggestion.partC.score}<span className="text-xs font-normal text-gray-400">/50</span></span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{aiSuggestion.partC.explanation}</p>
              <button
                type="button"
                onClick={() => setPartC(String(aiSuggestion.partC.score))}
                className="mt-2 text-xs text-teal-600 hover:text-teal-800 underline"
              >
                Принять только В
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Score Form */}
      <form action={action} className="space-y-4">
        <input type="hidden" name="id" value={id} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Часть Б (0–30)
            </label>
            <input
              type="number"
              name="part_b_score"
              min={0}
              max={30}
              value={partB}
              onChange={e => setPartB(e.target.value)}
              placeholder="0–30"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Часть В (0–50)
            </label>
            <input
              type="number"
              name="part_c_score"
              min={0}
              max={50}
              value={partC}
              onChange={e => setPartC(e.target.value)}
              placeholder="0–50"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {totalScore != null && !state.success && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
            <span className="text-gray-500">Итого: </span>
            <span className="font-bold text-gray-900">{totalScore}</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-gray-500">Уровень: </span>
            <span className="font-semibold text-gray-900">{level}</span>
          </div>
        )}

        {state.success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
            Баллы успешно сохранены
          </div>
        )}

        {state.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
            <p className="text-red-700 font-medium mb-1">Ошибка: баллы не сохранены</p>
            <p className="text-red-500 font-mono text-xs break-all">{state.error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? 'Сохранение...' : 'Сохранить оценки'}
        </button>
      </form>
    </div>
  )
}
