import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentStudent } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { MODULES, getAssignment } from '@/lib/course'

export const dynamic = 'force-dynamic'

interface Row {
  assignment_key: string
  content: { prompt?: string; ai_response?: string; rework?: string } | null
  updated_at: string | null
}

const PROTOCOL_KEYS = MODULES.flatMap(m => m.assignments)
  .filter(a => a.kind === 'protocol')
  .map(a => a.key)

export default async function DiaryPage() {
  const student = await getCurrentStudent()
  if (!student) redirect('/login')

  const { data } = await supabase
    .from('submissions')
    .select('assignment_key, content, updated_at')
    .eq('student_id', student.id)
    .in('assignment_key', PROTOCOL_KEYS)
    .order('updated_at', { ascending: true })

  const rows = (data ?? []) as Row[]

  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href="/cabinet" className="text-sm text-gray-400 hover:text-gray-600">← В кабинет</Link>

        <div className="mt-4 mb-6">
          <h1 className="text-xl font-bold text-gray-900">📓 ИИ-дневник</h1>
          <p className="text-sm text-gray-500">
            Протоколы вашей работы с нейросетями (Модуль 3): запрос, ответ ИИ и критическая переработка.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400">
              Дневник пока пуст. Он заполняется автоматически при выполнении заданий Модуля 3.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map(r => {
              const a = getAssignment(r.assignment_key)
              const c = r.content ?? {}
              return (
                <div key={r.assignment_key} className="rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{a?.title ?? r.assignment_key}</p>
                    {r.updated_at && (
                      <span className="text-xs text-gray-400">
                        {new Date(r.updated_at).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                  <div className="p-5 space-y-3">
                    <Protocol label="Промпт" value={c.prompt} accent="text-violet-600" />
                    <Protocol label="Ответ ИИ" value={c.ai_response} accent="text-teal-600" />
                    <Protocol label="Критическая переработка" value={c.rework} accent="text-amber-600" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

function Protocol({ label, value, accent }: { label: string; value?: string; accent: string }) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${accent}`}>{label}</p>
      {value ? (
        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{value}</p>
      ) : (
        <p className="text-sm text-gray-300 italic">не заполнено</p>
      )}
    </div>
  )
}
