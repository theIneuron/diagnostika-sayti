'use client'

import { useState, useActionState } from 'react'
import { scoreRespondent, type ScoreState } from '@/app/actions/scoreRespondent'
import type { PartEvaluation } from '@/lib/rubrics'

const initial: ScoreState = {}

type PartOutcome = ({ skipped: true; reason: string }) | ({ skipped?: false } & PartEvaluation)

interface AIResult {
  partB: PartOutcome
  partC: PartOutcome
  model?: string
  rubricVersion?: string
  warning?: string
}

function isEval(p: PartOutcome | null | undefined): p is PartEvaluation {
  return !!p && !('skipped' in p && p.skipped)
}

export function ScoreForm({
  id,
  partBScore,
  partCScore,
  totalScore,
  level,
  aiScoreB,
  aiScoreC,
}: {
  id: string
  partBScore: number | null
  partCScore: number | null
  totalScore: number | null
  level: string | null
  aiScoreB?: PartEvaluation | null
  aiScoreC?: PartEvaluation | null
}) {
  const [state, action, pending] = useActionState(scoreRespondent, initial)
  const [partB, setPartB] = useState<string>(partBScore != null ? String(partBScore) : '')
  const [partC, setPartC] = useState<string>(partCScore != null ? String(partCScore) : '')
  const [aiLoading, setAiLoading] = useState(false)
  // Изначально показываем ранее сохранённую ИИ-оценку, если она есть
  const [aiResult, setAiResult] = useState<AIResult | null>(
    aiScoreB || aiScoreC
      ? { partB: aiScoreB ?? { skipped: true, reason: 'empty' }, partC: aiScoreC ?? { skipped: true, reason: 'empty' } }
      : null,
  )
  const [aiError, setAiError] = useState<string | null>(null)

  async function handleAIScore() {
    setAiLoading(true)
    setAiError(null)
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
        setAiResult(data)
      }
    } catch (e) {
      setAiError(String(e))
    } finally {
      setAiLoading(false)
    }
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
        <p className="text-xs text-gray-400 mt-1">
          ИИ оценит открытые ответы по утверждённой рубрике и выставит балл в шкале платформы: Часть Б 0–30,
          Часть В 0–50. ИИ-оценка хранится отдельно от ручных баллов; ручной балл всегда за экспертом.
        </p>
      </div>

      {/* AI Error */}
      {aiError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <strong>Ошибка ИИ:</strong> {aiError}
        </div>
      )}

      {/* AI Result Panel — детальная оценка по рубрике */}
      {aiResult && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-violet-800">Оценка ИИ по рубрике</p>
            {aiResult.model && (
              <span className="text-[11px] text-violet-400">{aiResult.model} · рубрика {aiResult.rubricVersion}</span>
            )}
          </div>
          {aiResult.warning && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">{aiResult.warning}</p>
          )}
          <div className="grid md:grid-cols-2 gap-3">
            <PartCard
              title="Часть Б — Применение знаний"
              accent="violet"
              part={aiResult.partB}
              maxScale={30}
              onAccept={v => setPartB(String(v))}
            />
            <PartCard
              title="Часть В — Практическое задание"
              accent="teal"
              part={aiResult.partC}
              maxScale={50}
              onAccept={v => setPartC(String(v))}
            />
          </div>
          <p className="text-[11px] text-violet-400">
            «Принять» переносит балл ИИ в поле ручной оценки. Значение можно изменить перед сохранением.
          </p>
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

const ACCENTS = {
  violet: { text: 'text-violet-700', border: 'border-violet-100', badge: 'bg-violet-100 text-violet-700' },
  teal: { text: 'text-teal-700', border: 'border-teal-100', badge: 'bg-teal-100 text-teal-700' },
} as const

const LEVEL_COLOR: Record<string, string> = {
  высокий: 'text-green-600',
  средний: 'text-yellow-600',
  низкий: 'text-red-500',
}

function PartCard({
  title,
  accent,
  part,
  maxScale,
  onAccept,
}: {
  title: string
  accent: keyof typeof ACCENTS
  part: PartOutcome
  // Максимум ручной шкалы платформы для этой части (30 или 50)
  maxScale: number
  // Перенести рекомендованный балл в поле ручной оценки
  onAccept: (value: number) => void
}) {
  const a = ACCENTS[accent]
  // Пересчёт рубрики (0–12) в шкалу платформы через процент
  const recommended = isEval(part) ? Math.round((part.percent / 100) * maxScale) : null
  return (
    <div className={`bg-white rounded-lg p-3 border ${a.border}`}>
      <p className={`text-xs font-medium mb-2 ${a.text}`}>{title}</p>
      {!isEval(part) ? (
        <p className="text-xs text-gray-400 italic">Пропущено — ответ пустой</p>
      ) : (
        <>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-2xl font-bold ${a.text}`}>{recommended}</span>
            <span className="text-xs text-gray-400">/ {maxScale}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${a.badge}`}>{part.percent}%</span>
            <span className={`text-xs font-semibold ml-auto ${LEVEL_COLOR[part.level] ?? 'text-gray-500'}`}>
              {part.level}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">
            По рубрике: {part.total} / {part.max} (4 критерия × 0–3)
          </p>
          {recommended != null && (
            <button
              type="button"
              onClick={() => onAccept(recommended)}
              className={`mb-2 w-full text-xs font-medium px-2 py-1.5 rounded-lg border ${a.border} ${a.text} hover:bg-gray-50 transition-colors`}
            >
              Принять → {recommended} / {maxScale}
            </button>
          )}
          <ul className="space-y-1.5 mb-2">
            {part.criteria.map((c, i) => (
              <li key={i} className="text-xs">
                <div className="flex items-start gap-1.5">
                  <span className={`font-bold ${a.text} shrink-0 w-4`}>{c.score}</span>
                  <div>
                    <span className="font-medium text-gray-700">{c.name}</span>
                    {c.comment && <span className="text-gray-500"> — {c.comment}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {part.feedback && (
            <p className="text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-2 italic">
              {part.feedback}
            </p>
          )}
        </>
      )}
    </div>
  )
}
