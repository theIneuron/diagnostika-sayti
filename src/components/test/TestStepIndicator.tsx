import type { TestStep } from '@/types/test'

const LABELS: Record<TestStep, string> = {
  1: 'Теоретические знания (А)',
  2: 'Применение знаний (Б)',
  3: 'Практическое задание (В)',
}

export default function TestStepIndicator({ current }: { current: TestStep }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">Часть {current} из 3</span>
        <span className="text-sm font-medium text-indigo-600">{LABELS[current]}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(current / 3) * 100}%` }}
        />
      </div>
    </div>
  )
}
