'use client'

import type { AnketaFormData } from '@/types/anketa'
import { DIFFICULTY_OPTIONS } from '@/types/anketa'

interface Props {
  data: AnketaFormData
  onChange: (field: 'difficulties', value: string[]) => void
}

export default function BlockIV({ data, onChange }: Props) {
  const toggle = (option: string) => {
    const current = data.difficulties
    const updated = current.includes(option)
      ? current.filter(d => d !== option)
      : [...current, option]
    onChange('difficulties', updated)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Блок IV. Затруднения
        </h2>
        <p className="text-sm text-gray-500">
          Отметьте всё, что вызывает у вас затруднения. Можно выбрать несколько вариантов.
        </p>
      </div>

      <div className="space-y-3">
        {DIFFICULTY_OPTIONS.map(option => {
          const checked = data.difficulties.includes(option)
          return (
            <label
              key={option}
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                checked
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(option)}
                className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className={`text-sm ${checked ? 'text-indigo-700 font-medium' : 'text-gray-700'}`}>
                {option}
              </span>
            </label>
          )
        })}
      </div>

      <p className="text-xs text-gray-400">
        Если затруднений нет, можно оставить этот блок пустым.
      </p>
    </div>
  )
}
