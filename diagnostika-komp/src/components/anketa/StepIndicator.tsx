import type { FormStep } from '@/types/anketa'

const STEP_LABELS: Record<FormStep, string> = {
  1: 'Общие сведения',
  2: 'Самооценка',
  3: 'Частота использования',
  4: 'Затруднения',
  5: 'Открытый вопрос',
}

export default function StepIndicator({ current }: { current: FormStep }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">
          Шаг {current} из 5
        </span>
        <span className="text-sm font-medium text-indigo-600">
          {STEP_LABELS[current]}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(current / 5) * 100}%` }}
        />
      </div>
    </div>
  )
}
