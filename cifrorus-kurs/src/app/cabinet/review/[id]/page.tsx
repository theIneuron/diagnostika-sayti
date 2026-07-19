import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCurrentStudent } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { getAssignment } from '@/lib/course'
import { ReviewForm } from '@/components/ReviewForm'

export const dynamic = 'force-dynamic'

interface Target {
  id: string
  assignment_key: string
  student_id: string
  content: { text?: string; link?: string; prompt?: string; ai_response?: string; rework?: string } | null
  students: { full_name: string; study_group: string } | null
}

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const student = await getCurrentStudent()
  if (!student) redirect('/login')
  const { id } = await params

  const { data } = await supabase
    .from('submissions')
    .select('id, assignment_key, student_id, content, students(full_name, study_group)')
    .eq('id', id)
    .maybeSingle()
  const target = data as unknown as Target | null
  if (!target) notFound()
  if (target.student_id === student.id) redirect('/cabinet/review')

  const assignment = getAssignment(target.assignment_key)
  const c = target.content ?? {}

  // Уже рецензировал?
  const { data: existing } = await supabase
    .from('reviews')
    .select('content, approved')
    .eq('reviewer_id', student.id)
    .eq('target_submission_id', id)
    .maybeSingle()

  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href="/cabinet/review" className="text-sm text-gray-400 hover:text-gray-600">← К списку работ</Link>

        <div className="mt-4 mb-6">
          <p className="text-xs text-gray-400">{assignment?.title ?? target.assignment_key}</p>
          <h1 className="text-xl font-bold text-gray-900">Работа: {target.students?.full_name}</h1>
          <p className="text-sm text-gray-500">{target.students?.study_group}</p>
        </div>

        {/* Работа сокурсника */}
        <div className="rounded-2xl border border-gray-200 p-5 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Работа</p>
          {c.text && <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{c.text}</p>}
          {c.rework && <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{c.rework}</p>}
          {c.link && (
            <a href={c.link} target="_blank" rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-violet-600 hover:underline break-all">{c.link}</a>
          )}
          {!c.text && !c.rework && !c.link && <p className="text-sm text-gray-400 italic">Пусто</p>}
        </div>

        {/* Рецензия */}
        {existing ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
            <p className="text-sm font-semibold text-green-800 mb-2">
              Ваша рецензия отправлена {existing.approved ? '· одобрена преподавателем' : '· ждёт одобрения'}
            </p>
            <ReviewReadonly content={existing.content as Record<string, string>} />
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Ваша рецензия</p>
            <ReviewForm targetSubmissionId={target.id} />
          </div>
        )}
      </div>
    </main>
  )
}

function ReviewReadonly({ content }: { content: Record<string, string> }) {
  const rows: [string, string | undefined][] = [
    ['Достоинства', content.strengths],
    ['Недостатки', content.weaknesses],
    ['Рекомендации', content.suggestions],
  ]
  return (
    <div className="space-y-2">
      {rows.map(([label, val]) =>
        val ? (
          <div key={label}>
            <span className="text-xs font-semibold text-gray-500">{label}: </span>
            <span className="text-sm text-gray-700">{val}</span>
          </div>
        ) : null,
      )}
    </div>
  )
}
