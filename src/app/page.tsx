import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Диагностическое исследование
        </h1>
        <p className="text-gray-600 mb-2">
          Исследование цифровой компетентности будущих учителей русского языка
          в рамках диссертационной работы.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Заполнение занимает около 10–15 минут. Все данные хранятся анонимно.
        </p>
        <Link
          href="/anketa"
          className="inline-block px-8 py-3 text-base font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Начать опрос
        </Link>
      </div>
    </main>
  )
}
