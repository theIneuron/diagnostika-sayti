import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentStudent } from '@/lib/auth'
import { logoutStudent } from '@/app/actions/auth'
import { supabase } from '@/lib/supabase'
import { MODULES, TOTAL_MAX, levelFromTotal } from '@/lib/course'
import { IconBook, IconChat, IconLayers, IconLogout, IconPen } from '@/components/icons'

export const dynamic = 'force-dynamic'

interface SubRow {
  assignment_key: string
  status: string
  score: number | null
}

const NAV = [
  { href: '/cabinet/portfolio', label: 'Портфолио', icon: <IconLayers /> },
  { href: '/cabinet/forum', label: 'Форум', icon: <IconChat /> },
  { href: '/cabinet/review', label: 'Рецензии', icon: <IconPen /> },
  { href: '/cabinet/diary', label: 'ИИ-дневник', icon: <IconBook /> },
]

export default async function CabinetPage() {
  const student = await getCurrentStudent()
  if (!student) redirect('/login')

  const { data } = await supabase
    .from('submissions')
    .select('assignment_key, status, score')
    .eq('student_id', student.id)

  const subs = new Map<string, SubRow>()
  for (const s of (data ?? []) as SubRow[]) subs.set(s.assignment_key, s)

  let earned = 0
  for (const m of MODULES)
    for (const a of m.assignments)
      if (a.graded) earned += subs.get(a.key)?.score ?? 0

  const level = levelFromTotal(earned)
  const levelColor =
    level === 'высокий' ? 'text-green-600' : level === 'средний' ? 'text-yellow-600' : 'text-red-500'
  const pct = Math.min(100, (earned / TOTAL_MAX) * 100)

  return (
    <main className="flex-1">
      {/* Шапка */}
      <header className="glass sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/cabinet" className="font-bold text-gray-900 tracking-tight shrink-0">
            ЦифроРус<span className="text-gradient">-Курс</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(n => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-violet-700 hover:bg-violet-50 transition-colors"
              >
                <span className="text-gray-400">{n.icon}</span>
                {n.label}
              </Link>
            ))}
          </nav>
          <form action={logoutStudent}>
            <button
              title="Выйти"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <IconLogout />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </form>
        </div>
        {/* Мобильная навигация */}
        <nav className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          {NAV.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-white/60 border border-gray-100 whitespace-nowrap"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Приветствие */}
        <div className="animate-fade-up mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{student.full_name}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{student.study_group} · {student.university}</p>
        </div>

        {/* Балл */}
        <div className="animate-fade-up delay-1 card p-6 mb-10">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-widest">Текущий балл</p>
              <p className="text-4xl font-extrabold text-gray-900 tabular-nums">
                {earned}<span className="text-xl text-gray-300 font-bold"> / {TOTAL_MAX}</span>
              </p>
            </div>
            <div className="h-12 w-px bg-gray-100 hidden sm:block" />
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-widest">Уровень</p>
              <p className={`text-2xl font-bold ${levelColor}`}>{level}</p>
            </div>
            <div className="flex-1 min-w-40">
              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1.5 text-right text-[11px] text-gray-400">{Math.round(pct)}%</p>
            </div>
          </div>
        </div>

        {/* Модули */}
        <h2 className="animate-fade-up delay-2 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Модули курса
        </h2>
        <div className="stagger space-y-5">
          {MODULES.map(m => {
            const done = m.assignments.filter(a => {
              const st = subs.get(a.key)?.status
              return st === 'graded' || st === 'submitted'
            }).length
            return (
              <div key={m.n} className="card card-hover overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
                  <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.accent} text-white text-sm font-bold flex items-center justify-center shadow-md shrink-0`}>
                    {m.n}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                    <p className="text-xs text-gray-400">{m.weeks} · {m.hours}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden hidden sm:block">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${m.accent}`}
                        style={{ width: `${(done / m.assignments.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 tabular-nums">{done}/{m.assignments.length}</span>
                  </div>
                </div>
                <ul className="divide-y divide-gray-50">
                  {m.assignments.map(a => {
                    const s = subs.get(a.key)
                    return (
                      <li key={a.key}>
                        <Link
                          href={`/cabinet/task/${encodeURIComponent(a.key)}`}
                          className="group flex items-center gap-3 px-5 py-3 text-sm hover:bg-violet-50/40 transition-colors"
                        >
                          <StatusDot status={s?.status} />
                          <span className="flex-1 text-gray-700 group-hover:text-gray-900 transition-colors">{a.title}</span>
                          {a.points != null && (
                            <span className="text-xs text-gray-400 tabular-nums">
                              {s?.score != null ? `${s.score}/${a.points}` : `${a.points} б.`}
                            </span>
                          )}
                          <StatusBadge status={s?.status} check={a.check} />
                          <span className="text-gray-300 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all">›</span>
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
  if (status === 'graded') return <Badge className="bg-green-50 text-green-700 border-green-100">Оценено</Badge>
  if (status === 'submitted') return <Badge className="bg-amber-50 text-amber-700 border-amber-100">На проверке</Badge>
  if (status === 'draft') return <Badge className="bg-gray-50 text-gray-500 border-gray-100">Черновик</Badge>
  const label = check === 'auto' ? 'Тест' : check === 'ai' ? 'ИИ+эксперт' : 'Не начато'
  return <Badge className="bg-white text-gray-400 border-gray-100">{label}</Badge>
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${className}`}>{children}</span>
}
