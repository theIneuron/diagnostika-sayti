import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { supabase } from '@/lib/supabase'
import { getAssignment, MODULES } from '@/lib/course'
import { getRubric } from '@/lib/ai/rubrics'
import { AiScorePanel } from '@/components/AiScorePanel'
import { GradeForm } from '@/components/GradeForm'
import { approveReview } from '@/app/actions/reviews'
import { IconArrowLeft } from '@/components/icons'

export const dynamic = 'force-dynamic'

interface Sub {
  id: string
  assignment_key: string
  content: { text?: string; link?: string; prompt?: string; ai_response?: string; rework?: string } | null
  status: string
  score: number | null
  feedback: string | null
  ai_score: unknown
  ai_total: number | null
  ai_model: string | null
  students: { full_name: string; study_group: string; university: string } | null
}

export default async function AdminSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect('/admin/login')
  const { id } = await params

  const { data } = await supabase
    .from('submissions')
    .select('id, assignment_key, content, status, score, feedback, ai_score, ai_total, ai_model, students(full_name, study_group, university)')
    .eq('id', id)
    .maybeSingle()

  const sub = data as unknown as Sub | null
  if (!sub) notFound()

  const assignment = getAssignment(sub.assignment_key)
  const moduleOf = MODULES.find(m => m.assignments.some(a => a.key === sub.assignment_key))
  const rubric = getRubric(sub.assignment_key)
  const content = sub.content ?? {}
  const maxPoints = assignment?.points ?? 100

  // Рецензии сокурсников на эту работу
  const { data: reviewData } = await supabase
    .from('reviews')
    .select('id, content, approved, students:reviewer_id(full_name)')
    .eq('target_submission_id', sub.id)
    .order('created_at', { ascending: true })
  const reviews = (reviewData ?? []) as unknown as {
    id: string
    approved: boolean
    content: { strengths?: string; weaknesses?: string; suggestions?: string } | null
    students: { full_name: string } | null
  }[]

  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <IconArrowLeft /> В очередь
        </Link>

        <div className="animate-fade-up mt-5 mb-6">
          <p className="text-xs text-gray-400">
            {moduleOf && `Модуль ${moduleOf.n} · `}{assignment?.title ?? sub.assignment_key}
          </p>
          <h1 className="text-xl font-bold text-gray-900">{sub.students?.full_name ?? '—'}</h1>
          <p className="text-sm text-gray-500">{sub.students?.study_group} · {sub.students?.university}</p>
        </div>

        {/* Ответ студента */}
        <div className="animate-fade-up delay-1 card p-6 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ответ студента</p>
          {assignment?.kind === 'protocol' ? (
            <div className="space-y-3">
              <Field label="Промпт" value={content.prompt} accent="text-violet-600" />
              <Field label="Ответ ИИ" value={content.ai_response} accent="text-teal-600" />
              <Field label="Критическая переработка" value={content.rework} accent="text-amber-600" />
            </div>
          ) : (
            <>
              {content.text ? (
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{content.text}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">Текст не заполнен</p>
              )}
              {content.link && (
                <a href={content.link} target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-violet-600 hover:underline break-all">
                  {content.link}
                </a>
              )}
            </>
          )}
        </div>

        {/* Подсказка ИИ (только если у задания есть рубрика) */}
        {rubric && (
          <div className="mb-6">
            <AiScorePanel
              submissionId={sub.id}
              platformMax={rubric.platformMax}
              savedEval={(sub.ai_score as never) ?? null}
              savedScaled={sub.ai_total}
              model={sub.ai_model}
            />
          </div>
        )}

        {/* Выставление балла */}
        <div className="animate-fade-up delay-2 card p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Оценка преподавателя</p>
          <GradeForm
            submissionId={sub.id}
            assignmentKey={sub.assignment_key}
            maxPoints={maxPoints}
            initialScore={sub.score}
            initialFeedback={sub.feedback}
            aiSuggested={sub.ai_total}
          />
        </div>

        {/* Рецензии сокурсников — одобрение */}
        {reviews.length > 0 && (
          <div className="animate-fade-up delay-3 card mt-6 p-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Рецензии сокурсников ({reviews.length})
            </p>
            <div className="space-y-3">
              {reviews.map(rv => {
                const c = rv.content ?? {}
                return (
                  <div key={rv.id} className="rounded-xl border border-gray-100 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800">{rv.students?.full_name ?? '—'}</span>
                      {rv.approved ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                          Одобрена
                        </span>
                      ) : (
                        <form action={approveReview}>
                          <input type="hidden" name="review_id" value={rv.id} />
                          <input type="hidden" name="submission_id" value={sub.id} />
                          <button className="text-[11px] px-2.5 py-1 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors">
                            Одобрить
                          </button>
                        </form>
                      )}
                    </div>
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
    <p className="text-xs text-gray-600 mb-0.5">
      <span className="font-semibold text-gray-500">{label}: </span>
      {value}
    </p>
  )
}

function Field({ label, value, accent }: { label: string; value?: string; accent: string }) {
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
