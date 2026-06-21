'use client'

import type { AnketaFormData } from '@/types/anketa'
import { LIKERT_STATEMENTS } from '@/types/anketa'

interface Props {
  data: AnketaFormData
  onChange: (field: 'likert', value: Record<string, number>) => void
  errors: Record<string, string>
}

export default function BlockII({ data, onChange, errors }: Props) {
  const handleSelect = (key: string, value: number) => {
    onChange('likert', { ...data.likert, [key]: value })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Блок II. Самооценка цифровых навыков
        </h2>
        <p className="text-sm text-gray-500">
          Оцените каждое утверждение: 1 — совсем не умею, 5 — отлично умею.
        </p>
      </div>

      {LIKERT_STATEMENTS.map((statement, index) => {
        const key = `q${index + 1}`
        const selected = data.likert[key]

        return (
          <div
            key={key}
            className={`border rounded-lg p-4 ${
              errors.likert && !selected ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          >
            <p className="text-sm text-gray-800 mb-3">
              <span className="font-semibold text-indigo-600">{index + 1}.</span>{' '}
              {statement}
            </p>

            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleSelect(key, n)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                    selected === n
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-400 hover:bg-indigo-50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-1 px-1">
              <span className="text-xs text-gray-400">Совсем не умею</span>
              <span className="text-xs text-gray-400">Отлично умею</span>
            </div>
          </div>
        )
      })}

      {errors.likert && (
        <p className="text-sm text-red-500">{errors.likert}</p>
      )}
    </div>
  )
}
