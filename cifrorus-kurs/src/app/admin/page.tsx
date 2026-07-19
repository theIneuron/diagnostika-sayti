import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { logoutAdmin } from '@/app/actions/adminAuth'
import { supabase } from '@/lib/supabase'
import { getAssignment } from '@/lib/course'
import { IconBook, IconLogout, IconTable } from '@/components/icons'

export const dynamic = 'force-dynamic'

interface Row {
  id: string
  assignment_key: string
  status: string
  score: number | null
  ai_total: number | null
  submitted_at: string | null
  students: { full_name: string; study_group: string } | null
}

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  submitted: { text: 'На проверке', cls: 'bg-amber-100 text-amber-700' },
  graded: { text: 'Оценено', cls: 'bg-green-100 text-green-700' },
}

export default async function AdminPage() {
  if (!(await isAdmin())) redirect('/admin/login')

  const { data } = await supabase
    .from('submissions')
    .select('id, assignment_key, status, score, ai_total, submitted_at, students(full_name, study_group)')
    .neq('status', 'draft')
    .order('status', { ascending: true }) // graded < submitted алфавитно → submitted ниже; сортируем ниже вручную
    .order('submitted_at', { ascending: true })

  const rows = (data ?? []) as unknown as Row[]
  // Сначала «на проверке», потом оценённые
  rows.sort((a, b) => (a.status === b.status ? 0 : a.status === 'submitted' ? -1 : 1))

  const pending = rows.filter(r => r.status === 'submitted').length

  return (
    <main className="flex-1">
      <header className="glass sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-bold text-gray-900 tracking-tight">Панель преподавателя</p>
            <p className="text-xs text-gray-400">На проверке: {pending} · всего работ: {rows.length}</p>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/admin/vedomost" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-violet-700 hover:bg-violet-50 transition-colors">
              <span className="text-gray-400"><IconTable /></span>
              <span className="hidden sm:inline">Ведомость</span>
            </Link>
            <Link href="/admin/diaries" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-violet-700 hover:bg-violet-50 transition-colors">
              <span className="text-gray-400"><IconBook /></span>
              <span className="hidden sm:inline">ИИ-дневники</span>
            </Link>
            <form action={logoutAdmin}>
              <button title="Выйти" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <IconLogout />
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Очередь на проверку</h2>

        {rows.length === 0 ? (
          <p className="text-sm text-gray-400">Пока нет отправленных работ.</p>
        ) : (
          <div className="animate-fade-up card divide-y divide-gray-50 overflow-hidden">
            {rows.map(r => {
              const a = getAssignment(r.assignment_key)
              const badge = STATUS_LABEL[r.status]
              return (
                <Link
                  key={r.id}
                  href={`/admin/submission/${r.id}`}
                  className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{r.students?.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {r.students?.study_group} · {a?.title ?? r.assignment_key}
                    </p>
                  </div>
                  {r.ai_total != null && (
                    <span className="text-xs text-violet-500" title="Подсказка ИИ">ИИ: {r.ai_total}</span>
                  )}
                  {r.score != null && a?.points != null && (
                    <span className="text-xs text-gray-500">{r.score}/{a.points}</span>
                  )}
                  {badge && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.text}</span>
                  )}
                  <span className="text-gray-300">›</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
