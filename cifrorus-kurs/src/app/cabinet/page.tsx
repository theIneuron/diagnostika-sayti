import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentStudent } from '@/lib/auth'
import { logoutStudent } from '@/app/actions/auth'
import { supabase } from '@/lib/supabase'
import { MODULES, TOTAL_MAX, levelFromTotal } from '@/lib/course'

export const dynamic = 'force-dynamic'

interface SubRow {
  assignment_key: string
  status: string
  score: number | null
}

export default async function CabinetPage() {
  const student = await getCurrentStudent()
  if (!student) redirect('/login')

  const { data } = await supabase
    .from('submissions')
    .select('assignment_key, status, score')
    .eq('student_id', student.id)

  const subs = new Map<string, SubRow>()
  for (const s of (data ?? []) as SubRow[]) subs.set(s.assignment_key, s)

  // Текущий балл — сумма выставленных баллов по итоговым заданиям
  let earned = 0
  for (const m of MODULES)
    for (const a of m.assignments)
      if (a.graded) earned += subs.get(a.key)?.score ?? 0

  const level = levelFromTotal(earned)
  const levelColor =
    level === 'высокий' ? 'text-green-600' : level === 'средний' ? 'text-yellow-600' : 'text-red-500'

  return (
    <main className="flex-1">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">{student.full_name}</p>
            <p className="text-xs text-gray-400">{student.study_group} · {student.university}</p>
          </div>
          <form action={logoutStudent}>
            <button className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Выйти</button>
          </form>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Итоговый балл */}
        <div className="rounded-2xl border border-gray-200 p-5 mb-8 flex items-center gap-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Текущий балл</p>
            <p className="text-3xl font-bold text-gray-900">
              {earned}<span className="text-lg text-gray-300"> / {TOTAL_MAX}</span>
            </p>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Уровень</p>
            <p className={`text-xl font-semibold ${levelColor}`}>{level}</p>
          </div>
          <div className="flex-1 hidden sm:block">
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-violet-500" style={{ width: `${Math.min(100, (earned / TOTAL_MAX) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Модули */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Модули курса</h2>
        <div className="space-y-5">
          {MODULES.map(m => {
            const done = m.assignments.filter(a => subs.get(a.key)?.status === 'graded' || subs.get(a.key)?.status === 'submitted').length
            return (
              <div key={m.n} className="rounded-2xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.accent} text-white text-sm font-bold flex items-center justify-center`}>
                    {m.n}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                    <p className="text-xs text-gray-400">{m.weeks} · {m.hours}</p>
                  </div>
                  <span className="text-xs text-gray-400">{done}/{m.assignments.length}</span>
                </div>
                <ul className="divide-y divide-gray-50">
                  {m.assignments.map(a => {
                    const s = subs.get(a.key)
                    return (
                      <li key={a.key}>
                        <Link
                          href={`/cabinet/task/${encodeURIComponent(a.key)}`}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <StatusDot status={s?.status} />
                          <span className="flex-1 text-gray-700">{a.title}</span>
                          {a.points != null && (
                            <span className="text-xs text-gray-400">
                              {s?.score != null ? `${s.score}/${a.points}` : `${a.points} б.`}
                            </span>
                          )}
                          <StatusBadge status={s?.status} check={a.check} />
                          <span className="text-gray-300">›</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}

function StatusDot({ status }: { status?: string }) {
  const color =
    status === 'graded' ? 'bg-green-500' : status === 'submitted' ? 'bg-amber-400' : status === 'draft' ? 'bg-gray-300' : 'bg-gray-200'
  return <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
}

function StatusBadge({ status, check }: { status?: string; check: string }) {
  if (status === 'graded') return <Badge className="bg-green-100 text-green-700">Оценено</Badge>
  if (status === 'submitted') return <Badge className="bg-amber-100 text-amber-700">На проверке</Badge>
  if (status === 'draft') return <Badge className="bg-gray-100 text-gray-500">Черновик</Badge>
  const label = check === 'auto' ? 'Тест' : check === 'ai' ? 'ИИ+эксперт' : 'Не начато'
  return <Badge className="bg-gray-50 text-gray-400">{label}</Badge>
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${className}`}>{children}</span>
}
