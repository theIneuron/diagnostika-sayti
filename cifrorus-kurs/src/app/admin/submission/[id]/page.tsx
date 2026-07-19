import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { supabase } from '@/lib/supabase'
import { getAssignment, MODULES } from '@/lib/course'
import { getRubric } from '@/lib/ai/rubrics'
import { AiScorePanel } from '@/components/AiScorePanel'
import { GradeForm } from '@/components/GradeForm'

export const dynamic = 'force-dynamic'

interface Sub {
  id: string
  assignment_key: string
  content: { text?: string; link?: string } | null
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

  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">← В очередь</Link>

        <div className="mt-4 mb-6">
          <p className="text-xs text-gray-400">
            {moduleOf && `Модуль ${moduleOf.n} · `}{assignment?.title ?? sub.assignment_key}
          </p>
          <h1 className="text-xl font-bold text-gray-900">{sub.students?.full_name ?? '—'}</h1>
          <p className="text-sm text-gray-500">{sub.students?.study_group} · {sub.students?.university}</p>
        </div>

        {/* Ответ студента */}
        <div className="rounded-2xl border border-gray-200 p-5 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ответ студента</p>
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
        <div className="rounded-2xl border border-gray-200 p-5">
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
      </div>
    </main>
  )
}
