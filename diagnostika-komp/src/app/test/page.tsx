import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import TestForm from '@/components/test/TestForm'

export const metadata: Metadata = {
  title: 'Тест | ДиагКомп-Рус',
}

interface Props {
  searchParams: Promise<{ rid?: string }>
}

export default async function TestPage({ searchParams }: Props) {
  const { rid } = await searchParams

  if (!rid) {
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Тест</h1>
          <p className="mt-2 text-sm text-gray-500">
            Инструмент 2 — проверка знаний и практических навыков
          </p>
        </div>

        <TestForm respondentId={rid} />
      </div>
    </main>
  )
}
