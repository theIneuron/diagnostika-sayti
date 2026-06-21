'use client'

import type { Question } from '@/types/test'

interface Props {
  questions: Question[]
  answers: Record<string, string>
  onChange: (questionId: string, value: string) => void
  errors: Record<string, string>
}

export default function PartA({ questions, answers, onChange, errors }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Часть А. Теоретические знания
        </h2>
        <p className="text-sm text-gray-500">
          Выберите один правильный ответ для каждого вопроса. 15 вопросов.
        </p>
      </div>

      {questions.map((q, index) => {
        const selected = answers[q.id]
        const hasError = errors[q.id]

        return (
          <div
            key={q.id}
            className={`border rounded-lg p-4 ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
          >
            <p className="text-sm font-medium text-gray-800 mb-3">
              <span className="text-indigo-600">{index + 1}.</span> {q.text}
            </p>
            <div className="space-y-2">
              {q.options.map(option => (
                <label
                  key={option}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                    selected === option
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-700 hover:border-indigo-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={option}
                    checked={selected === option}
                    onChange={() => onChange(q.id, option)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        )
      })}

      {errors.partA && (
        <p className="text-sm text-red-500">{errors.partA}</p>
      )}
    </div>
  )
}
