import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentStudent } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { getAssignment } from '@/lib/course'

export const dynamic = 'force-dynamic'

interface Row {
  id: string
  assignment_key: string
  student_id: string
  students: { full_name: string; study_group: string } | null
}

export default async function ReviewListPage() {
  const student = await getCurrentStudent()
  if (!student) redirect('/login')

  // Работы сокурсников, отправленные на проверку или оценённые
  const { data } = await supabase
    .from('submissions')
    .select('id, assignment_key, student_id, students(full_name, study_group)')
    .neq('student_id', student.id)
    .in('status', ['submitted', 'graded'])
    .order('submitted_at', { ascending: false })

  const rows = (data ?? []) as unknown as Row[]

  // Работы, которые я уже рецензировал
  const { data: mine } = await supabase
    .from('reviews')
    .select('target_submission_id')
    .eq('reviewer_id', student.id)
  const reviewed = new Set((mine ?? []).map(r => r.target_submission_id))

  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href="/cabinet" className="text-sm text-gray-400 hover:text-gray-600">← В кабинет</Link>

        <div className="mt-4 mb-6">
          <h1 className="text-xl font-bold text-gray-900">📝 Рецензирование</h1>
          <p className="text-sm text-gray-500">
            Задание 4.4: выберите работу сокурсника и напишите структурированную рецензию.
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-gray-400">Пока нет доступных для рецензии работ.</p>
        ) : (
          <div className="rounded-2xl border border-gray-200 divide-y divide-gray-50 overflow-hidden">
            {rows.map(r => {
              const a = getAssignment(r.assignment_key)
              const done = reviewed.has(r.id)
              return (
                <Link
                  key={r.id}
                  href={`/cabinet/review/${r.id}`}
                  className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{a?.title ?? r.assignment_key}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {r.students?.full_name} · {r.students?.study_group}
                    </p>
                  </div>
                  {done ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                      Рецензия написана
                    </span>
                  ) : (
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
                      Рецензировать
                    </span>
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
