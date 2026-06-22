'use client'

import { useActionState } from 'react'
import { scoreRespondent, type ScoreState } from '@/app/actions/scoreRespondent'

const initial: ScoreState = {}

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

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />

      {/* Rubrikalar */}
      <div className="grid grid-cols-2 gap-4">
        <details className="group">
          <summary className="cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-800 select-none list-none flex items-center gap-1 mb-2">
            <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
            Б qismi rubrikasi (0–30)
          </summary>
          <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 space-y-1.5 mb-2 border border-gray-200">
            <div className="flex gap-2"><span className="font-semibold text-orange-600 w-12 shrink-0">0–10</span><span>Raqamli vositalar umuman eslatilmagan yoki mavzuga aloqasi yo'q</span></div>
            <div className="flex gap-2"><span className="font-semibold text-yellow-600 w-12 shrink-0">11–20</span><span>1–2 ta tegishli vosita eslatilgan, asoslama yetarli emas</span></div>
            <div className="flex gap-2"><span className="font-semibold text-green-600 w-12 shrink-0">21–30</span><span>3+ ta tegishli vosita har biri asoslangan holda ko'rsatilgan</span></div>
          </div>
        </details>

        <details className="group">
          <summary className="cursor-pointer text-xs font-medium text-teal-600 hover:text-teal-800 select-none list-none flex items-center gap-1 mb-2">
            <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
            V qismi rubrikasi (0–50)
          </summary>
          <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 space-y-1.5 mb-2 border border-gray-200">
            <div className="flex gap-2"><span className="font-semibold text-orange-600 w-12 shrink-0">0–15</span><span>Topshiriq taqdim etilmagan yoki talabga umuman mos kelmaydi</span></div>
            <div className="flex gap-2"><span className="font-semibold text-yellow-600 w-12 shrink-0">16–30</span><span>Qisman bajarilgan, asoslama sust yoki yuzaki</span></div>
            <div className="flex gap-2"><span className="font-semibold text-blue-600 w-12 shrink-0">31–40</span><span>Talabni qondiradi, asoslama yetarli darajada</span></div>
            <div className="flex gap-2"><span className="font-semibold text-green-600 w-12 shrink-0">41–50</span><span>To'liq bajarilgan, batafsil va aniq asoslama bilan</span></div>
          </div>
        </details>
      </div>

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
            defaultValue={partBScore ?? ''}
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
            defaultValue={partCScore ?? ''}
            placeholder="0–50"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {totalScore != null && !state.success && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
          <span className="text-gray-500">Jami: </span>
          <span className="font-bold text-gray-900">{totalScore}</span>
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-gray-500">Daraja: </span>
          <span className="font-semibold text-gray-900">{level}</span>
        </div>
      )}

      {state.success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
          Balllar muvaffaqiyatli saqlandi
        </div>
      )}

      {state.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
          <p className="text-red-700 font-medium mb-1">Xato: ball saqlanmadi</p>
          <p className="text-red-500 font-mono text-xs break-all">{state.error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? 'Saqlanmoqda...' : 'Сохранить оценки'}
      </button>
    </form>
  )
}
