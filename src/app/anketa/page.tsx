import type { Metadata } from 'next'
import AnketaForm from '@/components/anketa/AnketaForm'

export const metadata: Metadata = {
  title: 'Диагностический опрос | Анкета',
}

export default function AnketaPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Диагностический опрос
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Исследование цифровой компетентности будущих учителей русского языка
          </p>
        </div>

        <AnketaForm />
      </div>
    </main>
  )
}
