import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCurrentStudent } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { getAssignment, MODULES } from '@/lib/course'
import { getRubric } from '@/lib/ai/rubrics'
import { TaskForm } from '@/components/TaskForm'
import { AiScorePanel } from '@/components/AiScorePanel'

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
    .select('content, status, score, feedback, ai_score, ai_total, ai_model')
    .eq('student_id', student.id)
    .eq('assignment_key', decodedKey)
    .maybeSingle()

  const content = (sub?.content ?? {}) as { text?: string; link?: string }
  const status: string | null = sub?.status ?? null
  const badge = status ? STATUS_LABEL[status] : null

  const rubric = getRubric(decodedKey)
  const showAi = assignment.check === 'ai' && !!rubric && !!(content.text && content.text.trim())

  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href="/cabinet" className="text-sm text-gray-400 hover:text-gray-600">← В кабинет</Link>

        <div className="mt-4 flex items-start justify-between gap-4">
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

        <div className="mt-6 rounded-2xl border border-gray-200 p-5">
          {assignment.check === 'auto' ? (
            <p className="text-sm text-gray-500">
              Это тест из 30 вопросов с автоматической проверкой. Прохождение теста будет добавлено
              в следующем обновлении.
            </p>
          ) : (
            <TaskForm
              assignmentKey={decodedKey}
              text={content.text ?? ''}
              link={content.link ?? ''}
              status={status}
              needsLink
            />
          )}
        </div>

        {/* Оценка ИИ (формативная, для заданий с рубрикой) */}
        {showAi && rubric && (
          <AiScorePanel
            assignmentKey={decodedKey}
            platformMax={rubric.platformMax}
            savedEval={sub?.ai_score ?? null}
            savedScaled={sub?.ai_total ?? null}
            model={sub?.ai_model ?? null}
          />
        )}

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
      </div>
    </main>
  )
}
