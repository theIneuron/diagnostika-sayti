'use client'

import type { AnketaFormData } from '@/types/anketa'

const MAX_CHARS = 1000

interface Props {
  data: AnketaFormData
  onChange: (field: 'openAnswer', value: string) => void
}

export default function BlockV({ data, onChange }: Props) {
  const remaining = MAX_CHARS - data.openAnswer.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Блок V. Открытый вопрос
        </h2>
        <p className="text-sm text-gray-500">
          Ответ необязателен, но очень ценен для исследования.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Что, на ваш взгляд, помогло бы вам увереннее использовать цифровые
          технологии в будущей работе учителя?
        </label>
        <textarea
          value={data.openAnswer}
          onChange={e => {
            if (e.target.value.length <= MAX_CHARS) {
              onChange('openAnswer', e.target.value)
            }
          }}
          rows={6}
          placeholder="Напишите свои мысли..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${remaining < 100 ? 'text-orange-500' : 'text-gray-400'}`}>
            {remaining} символов осталось
          </span>
        </div>
      </div>
    </div>
  )
}
