'use client'

import type { AnketaFormData } from '@/types/anketa'
import { FREQUENCY_TOOLS, FREQUENCY_OPTIONS } from '@/types/anketa'

interface Props {
  data: AnketaFormData
  onChange: (field: 'frequency', value: Record<string, string>) => void
  errors: Record<string, string>
}

export default function BlockIII({ data, onChange, errors }: Props) {
  const handleSelect = (toolKey: string, option: string) => {
    onChange('frequency', { ...data.frequency, [toolKey]: option })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Блок III. Частота использования
        </h2>
        <p className="text-sm text-gray-500">
          Как часто вы используете следующие инструменты?
        </p>
      </div>

      {FREQUENCY_TOOLS.map(tool => {
        const selected = data.frequency[tool.key]
        const hasError = errors.frequency && !selected

        return (
          <div
            key={tool.key}
            className={`border rounded-lg p-4 ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
          >
            <p className="text-sm font-medium text-gray-800 mb-3">{tool.label}</p>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2">
              {FREQUENCY_OPTIONS.map(option => (
                <label
                  key={option}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                    selected === option
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={tool.key}
                    value={option}
                    checked={selected === option}
                    onChange={() => handleSelect(tool.key, option)}
                    className="sr-only"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        )
      })}

      {errors.frequency && (
        <p className="text-sm text-red-500">{errors.frequency}</p>
      )}
    </div>
  )
}
