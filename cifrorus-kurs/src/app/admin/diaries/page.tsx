import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { supabase } from '@/lib/supabase'
import { MODULES, getAssignment } from '@/lib/course'

export const dynamic = 'force-dynamic'

const PROTOCOL_KEYS = MODULES.flatMap(m => m.assignments)
  .filter(a => a.kind === 'protocol')
  .map(a => a.key)

interface Row {
  assignment_key: string
  content: { prompt?: string; ai_response?: string; rework?: string } | null
  student_id: string
  students: { full_name: string; study_group: string } | null
}

export default async function DiariesPage() {
  if (!(await isAdmin())) redirect('/admin/login')

  const { data } = await supabase
    .from('submissions')
    .select('assignment_key, content, student_id, students(full_name, study_group)')
    .in('assignment_key', PROTOCOL_KEYS)
    .order('student_id')

  const rows = (data ?? []) as unknown as Row[]

  // Группируем по студенту
  const byStudent = new Map<string, { name: string; group: string; items: Row[] }>()
  for (const r of rows) {
    if (!byStudent.has(r.student_id)) {
      byStudent.set(r.student_id, {
        name: r.students?.full_name ?? '—',
        group: r.students?.study_group ?? '',
        items: [],
      })
    }
    byStudent.get(r.student_id)!.items.push(r)
  }
  const groups = [...byStudent.values()].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">← В панель</Link>
        <h1 className="text-xl font-bold text-gray-900 mt-2 mb-1">ИИ-дневники студентов</h1>
        <p className="text-sm text-gray-500 mb-6">Протоколы работы с нейросетями (Модуль 3).</p>

        {groups.length === 0 ? (
          <p className="text-sm text-gray-400">Пока нет заполненных протоколов.</p>
        ) : (
          <div className="space-y-6">
            {groups.map((g, gi) => (
              <div key={gi} className="rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{g.name}</p>
                  <p className="text-xs text-gray-400">{g.group}</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {g.items.map((r, i) => {
                    const c = r.content ?? {}
                    return (
                      <div key={i} className="p-5 space-y-2">
                        <p className="text-xs font-semibold text-gray-500">{getAssignment(r.assignment_key)?.title ?? r.assignment_key}</p>
                        <Line label="Промпт" value={c.prompt} accent="text-violet-600" />
                        <Line label="Ответ ИИ" value={c.ai_response} accent="text-teal-600" />
                        <Line label="Переработка" value={c.rework} accent="text-amber-600" />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function Line({ label, value, accent }: { label: string; value?: string; accent: string }) {
  if (!value) return null
  return (
    <p className="text-xs text-gray-700">
      <span className={`font-semibold ${accent}`}>{label}: </span>
      {value}
    </p>
  )
}
