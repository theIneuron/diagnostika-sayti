import type { Metadata } from 'next'
import AnketaForm from '@/components/anketa/AnketaForm'

export const metadata: Metadata = {
  title: 'Диагностический опрос | Анкета',
}

interface Props {
  searchParams: Promise<{ wave?: string }>
}

export default async function AnketaPage({ searchParams }: Props) {
  const { wave } = await searchParams
  const waveNum = wave === '2' ? 2 : 1

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
          {waveNum === 2 && (
            <span className="mt-2 inline-block px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
              To'lqin 2
            </span>
          )}
        </div>

        <AnketaForm wave={waveNum} />
      </div>
    </main>
  )
}
