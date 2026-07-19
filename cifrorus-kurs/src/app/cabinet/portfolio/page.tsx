import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentStudent } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { getAssignment, MODULES } from '@/lib/course'
import { IconArrowLeft, IconBadge, IconLayers } from '@/components/icons'

export const dynamic = 'force-dynamic'

interface Row {
  assignment_key: string
  content: { text?: string; link?: string; rework?: string } | null
  status: string
  score: number | null
  updated_at: string | null
}

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  draft: { text: 'Черновик', cls: 'bg-gray-100 text-gray-500' },
  submitted: { text: 'На проверке', cls: 'bg-amber-100 text-amber-700' },
  graded: { text: 'Оценено', cls: 'bg-green-100 text-green-700' },
}

// Порядок заданий как в курсе — для стабильной сортировки портфолио
const ORDER = MODULES.flatMap(m => m.assignments).map(a => a.key)

function snippet(c: Row['content']): string {
  const t = c?.text || c?.rework || c?.link || ''
  return t.length > 120 ? t.slice(0, 120) + '…' : t
}

export default async function PortfolioPage() {
  const student = await getCurrentStudent()
  if (!student) redirect('/login')

  const { data } = await supabase
    .from('submissions')
    .select('assignment_key, content, status, score, updated_at')
    .eq('student_id', student.id)

  const rows = (data ?? []) as Row[]
  rows.sort((a, b) => ORDER.indexOf(a.assignment_key) - ORDER.indexOf(b.assignment_key))

  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href="/cabinet" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <IconArrowLeft /> В кабинет
        </Link>

        <div className="animate-fade-up mt-5 mb-7 flex items-start gap-3.5">
          <IconBadge tint="bg-emerald-50 border-emerald-100 text-emerald-600">
            <IconLayers />
          </IconBadge>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Портфолио</h1>
            <p className="text-sm text-gray-500 mt-0.5">Все ваши работы по курсу в одном месте.</p>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-gray-400">Вы ещё не начинали ни одного задания.</p>
        ) : (
          <div className="stagger space-y-3">
            {rows.map(r => {
              const a = getAssignment(r.assignment_key)
              const badge = STATUS_LABEL[r.status]
              return (
                <Link
                  key={r.assignment_key}
                  href={`/cabinet/task/${encodeURIComponent(r.assignment_key)}`}
                  className="card card-hover block p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900">{a?.title ?? r.assignment_key}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {r.score != null && a?.points != null && (
                        <span className="text-xs text-gray-500">{r.score}/{a.points}</span>
                      )}
                      {badge && (
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.text}</span>
                      )}
                    </div>
                  </div>
                  {snippet(r.content) && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">{snippet(r.content)}</p>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
