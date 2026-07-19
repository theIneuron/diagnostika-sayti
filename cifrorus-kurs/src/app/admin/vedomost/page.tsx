import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { supabase } from '@/lib/supabase'
import { MODULES, TOTAL_MAX, levelFromTotal } from '@/lib/course'
import { IconArrowLeft, IconDownload } from '@/components/icons'

export const dynamic = 'force-dynamic'

const GRADED = MODULES.flatMap(m => m.assignments).filter(a => a.graded)

interface Student {
  id: string
  full_name: string
  study_group: string
}

export default async function VedomostPage() {
  if (!(await isAdmin())) redirect('/admin/login')

  const [{ data: students }, { data: subs }] = await Promise.all([
    supabase.from('students').select('id, full_name, study_group').order('full_name'),
    supabase.from('submissions').select('student_id, assignment_key, score'),
  ])

  // Карта баллов: student_id → assignment_key → score
  const scores = new Map<string, Map<string, number>>()
  for (const s of subs ?? []) {
    if (s.score == null) continue
    if (!scores.has(s.student_id)) scores.set(s.student_id, new Map())
    scores.get(s.student_id)!.set(s.assignment_key, s.score)
  }

  const rows = (students ?? []) as Student[]

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
              <IconArrowLeft /> В панель
            </Link>
            <h1 className="text-xl font-bold text-gray-900 mt-2">Итоговая ведомость</h1>
            <p className="text-sm text-gray-500">Студентов: {rows.length} · максимум {TOTAL_MAX} баллов</p>
          </div>
          <a
            href="/admin/vedomost/excel"
            className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl"
          >
            <IconDownload /> Экспорт Excel
          </a>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-gray-400">Пока нет зарегистрированных студентов.</p>
        ) : (
          <div className="animate-fade-up card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-4 py-2.5 font-semibold text-gray-700 sticky left-0 bg-gray-50">Студент</th>
                  {GRADED.map(a => (
                    <th key={a.key} className="px-3 py-2.5 font-medium text-gray-500 text-center whitespace-nowrap" title={a.title}>
                      {a.key} <span className="text-gray-300">/{a.points}</span>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 font-semibold text-gray-700 text-center">Итого</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 text-center">Уровень</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map(st => {
                  const sm = scores.get(st.id)
                  let total = 0
                  for (const a of GRADED) total += sm?.get(a.key) ?? 0
                  const level = levelFromTotal(total)
                  const lc = level === 'высокий' ? 'text-green-600' : level === 'средний' ? 'text-yellow-600' : 'text-red-500'
                  return (
                    <tr key={st.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 sticky left-0 bg-white">
                        <p className="font-medium text-gray-900 whitespace-nowrap">{st.full_name}</p>
                        <p className="text-xs text-gray-400">{st.study_group}</p>
                      </td>
                      {GRADED.map(a => {
                        const v = sm?.get(a.key)
                        return (
                          <td key={a.key} className="px-3 py-2 text-center text-gray-700">
                            {v != null ? v : <span className="text-gray-300">—</span>}
                          </td>
                        )
                      })}
                      <td className="px-3 py-2 text-center font-bold text-gray-900">{total}</td>
                      <td className={`px-3 py-2 text-center font-semibold ${lc}`}>{level}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
