import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCurrentStudent } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { getAssignment, MODULES } from '@/lib/course'
import { TaskForm } from '@/components/TaskForm'
import { IconArrowLeft } from '@/components/icons'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  draft: { text: 'Черновик', cls: 'bg-gray-100 text-gray-500' },
  submitted: { text: 'На проверке', cls: 'bg-amber-100 text-amber-700' },
  graded: { text: 'Оценено', cls: 'bg-green-100 text-green-700' },
}

export default async function TaskPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const decodedKey = decodeURIComponent(key)

  const student = await getCurrentStudent()
  if (!student) redirect('/login')

  const assignment = getAssignment(decodedKey)
  if (!assignment) notFound()

  const moduleOf = MODULES.find(m => m.assignments.some(a => a.key === decodedKey))

  const { data: sub } = await supabase
    .from('submissions')
    .select('id, content, status, score, feedback, ai_score, ai_total, ai_model')
    .eq('student_id', student.id)
    .eq('assignment_key', decodedKey)
    .maybeSingle()

  // Одобренные преподавателем рецензии сокурсников на эту работу
  const { data: reviewData } = sub
    ? await supabase
        .from('reviews')
        .select('id, content')
        .eq('target_submission_id', sub.id)
        .eq('approved', true)
    : { data: null }
  const approvedReviews = (reviewData ?? []) as unknown as {
    id: string
    content: { strengths?: string; weaknesses?: string; suggestions?: string } | null
  }[]

  const content = (sub?.content ?? {}) as {
    text?: string; link?: string; prompt?: string; ai_response?: string; rework?: string
  }
  const status: string | null = sub?.status ?? null
  const badge = status ? STATUS_LABEL[status] : null

  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href="/cabinet" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <IconArrowLeft /> В кабинет
        </Link>

        <div className="animate-fade-up mt-5 flex items-start justify-between gap-4">
          <div>
            {moduleOf && (
              <p className="text-xs text-gray-400 mb-1">Модуль {moduleOf.n} · {moduleOf.title}</p>
            )}
            <h1 className="text-xl font-bold text-gray-900">{assignment.title}</h1>
          </div>
          {badge && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${badge.cls}`}>{badge.text}</span>
          )}
        </div>

        {assignment.points != null && (
          <p className="mt-1 text-sm text-gray-500">
            Максимум: <span className="font-semibold text-gray-700">{assignment.points} баллов</span>
            {assignment.check === 'ai' && ' · оценивается ИИ + экспертом'}
          </p>
        )}

        <div className="animate-fade-up delay-1 card mt-6 p-6">
          {assignment.check === 'auto' ? (
            <p className="text-sm text-gray-500">
              Это тест из 30 вопросов с автоматической проверкой. Прохождение теста будет добавлено
              в следующем обновлении.
            </p>
          ) : (
            <TaskForm
              assignmentKey={decodedKey}
              content={content}
              status={status}
              kind={assignment.kind}
              needsLink
            />
          )}
        </div>

        {/* Результат проверки */}
        {status === 'graded' && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
            <p className="text-sm font-semibold text-green-800 mb-2">Результат проверки</p>
            {sub?.score != null && assignment.points != null && (
              <p className="text-2xl font-bold text-green-700">
                {sub.score}<span className="text-base font-normal text-green-500"> / {assignment.points}</span>
              </p>
            )}
            {sub?.feedback && <p className="mt-2 text-sm text-gray-700 leading-relaxed">{sub.feedback}</p>}
          </div>
        )}

        {/* Рецензии сокурсников (одобренные преподавателем) */}
        {approvedReviews.length > 0 && (
          <div className="animate-fade-up delay-1 card mt-6 p-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Рецензии сокурсников
            </p>
            <div className="space-y-3">
              {approvedReviews.map(rv => {
                const c = rv.content ?? {}
                return (
                  <div key={rv.id} className="rounded-xl border border-gray-100 p-3 space-y-0.5">
                    {c.strengths && <ReviewLine label="Достоинства" value={c.strengths} />}
                    {c.weaknesses && <ReviewLine label="Недостатки" value={c.weaknesses} />}
                    {c.suggestions && <ReviewLine label="Рекомендации" value={c.suggestions} />}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function ReviewLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-xs text-gray-600">
      <span className="font-semibold text-gray-500">{label}: </span>
      {value}
    </p>
  )
}
