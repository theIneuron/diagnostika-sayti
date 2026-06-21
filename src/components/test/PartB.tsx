'use client'

const MAX_WORDS = 500

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

interface Props {
  caseText: string
  answer: string
  onChange: (value: string) => void
}

export default function PartB({ caseText, answer, onChange }: Props) {
  const wordCount = countWords(answer)
  const isOverLimit = wordCount > MAX_WORDS

  const handleChange = (value: string) => {
    // So'z limitini oshirib yuborishiga yo'l qo'ymaylik — lekin o'chirish imkonini beramiz
    const words = countWords(value)
    if (words <= MAX_WORDS + 20) {
      onChange(value)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Часть Б. Применение знаний
        </h2>
        <p className="text-sm text-gray-500">
          Прочитайте кейс и дайте развёрнутый ответ. До {MAX_WORDS} слов.
        </p>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-indigo-800 mb-2">Кейс:</p>
        <p className="text-sm text-indigo-900 leading-relaxed">{caseText}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ваш ответ
        </label>
        <textarea
          value={answer}
          onChange={e => handleChange(e.target.value)}
          rows={8}
          placeholder="Напишите развёрнутый ответ..."
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none ${
            isOverLimit
              ? 'border-red-400 focus:ring-red-500'
              : 'border-gray-300 focus:ring-indigo-500'
          }`}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">Необязательно, но ценно для исследования</span>
          <span className={`text-xs font-medium ${isOverLimit ? 'text-red-500' : wordCount > MAX_WORDS * 0.85 ? 'text-orange-500' : 'text-gray-400'}`}>
            {wordCount} / {MAX_WORDS} слов
          </span>
        </div>
      </div>
    </div>
  )
}
