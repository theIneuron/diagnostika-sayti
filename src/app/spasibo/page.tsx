import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Спасибо за участие!',
}

export default function SpasiboPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Спасибо за участие!
        </h1>
        <p className="text-gray-600 leading-relaxed">
          Ваши ответы успешно сохранены. Они будут использованы исключительно
          в научном исследовании в обезличенном виде. Благодарим за ваше время
          и честные ответы — это важный вклад в развитие методики обучения.
        </p>
      </div>
    </main>
  )
}
