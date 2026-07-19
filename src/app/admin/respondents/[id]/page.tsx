import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ScoreForm } from '@/components/admin/ScoreForm'
import {
  LIKERT_STATEMENTS,
  FREQUENCY_TOOLS,
  FREQUENCY_OPTIONS,
  DIFFICULTY_OPTIONS,
} from '@/types/anketa'
import { PART_A_QUESTIONS } from '@/types/test'

export const dynamic = 'force-dynamic'
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: `Respondent | Admin` }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server tomonda — brauzerga chiqmaydi
const CORRECT_ANSWERS: Record<string, string> = {
  q1: 'Система управления обучением',
  q2: 'Moodle',
  q3: 'Мастерская (Workshop)',
  q4: 'Google',
  q5: 'GIFT/XML',
  q6: 'Искусственный интеллект',
  q7: 'ChatGPT',
  q8: 'Текстовый запрос пользователя к ИИ',
  q9: 'Уверенная генерация недостоверной информации',
  q10: 'Kahoot',
  q11: 'Электронных карточках с адаптивным повторением',
  q12: 'Сочетание очных занятий и онлайн-компонента',
  q13: 'Проверка грамматики и стиля текста',
  q14: 'Отслеживание прогресса и активности студентов',
  q15: 'Использование ИИ следует декларировать, сохраняя авторскую ответственность',
}

export default async function RespondentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: r } = await supabase.from('respondents').select('*').eq('id', id).single()
  if (!r) notFound()

  // Adjacent respondents for prev/next navigation
  const [{ data: prevData }, { data: nextData }] = await Promise.all([
    supabase
      .from('respondents')
      .select('id')
      .lt('created_at', r.created_at)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('respondents')
      .select('id')
      .gt('created_at', r.created_at)
      .order('created_at', { ascending: true })
      .limit(1),
  ])
  const prevId = prevData?.[0]?.id ?? null
  const nextId = nextData?.[0]?.id ?? null

  const partAAnswers: Record<string, string> = r.part_a_answers ?? {}

  const partACorrect = PART_A_QUESTIONS.filter(q => partAAnswers[q.id] === CORRECT_ANSWERS[q.id]).length
  const isScored = r.part_b_score != null && r.part_c_score != null

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/respondents" className="text-sm text-gray-400 hover:text-gray-600">
          ← К списку
        </Link>
        <div className="flex items-center gap-2">
          {!isScored && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
              Не оценён
            </span>
          )}
          <Link
            href={prevId ? `/admin/respondents/${prevId}` : '#'}
            className={`px-3 py-1.5 text-sm border rounded-lg ${prevId ? 'border-gray-300 text-gray-600 hover:bg-gray-50' : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}
            aria-disabled={!prevId}
          >
            ← Предыдущий
          </Link>
          <Link
            href={nextId ? `/admin/respondents/${nextId}` : '#'}
            className={`px-3 py-1.5 text-sm border rounded-lg ${nextId ? 'border-gray-300 text-gray-600 hover:bg-gray-50' : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}
            aria-disabled={!nextId}
          >
            Следующий →
          </Link>
        </div>
      </div>

      {/* Score summary bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-6 items-center">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Вуз</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">{r.university ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Курс</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">{r.course ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Волна</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">{r.wave ?? 1}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Part A</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">{r.part_a_score ?? partACorrect} / 20</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Part B</p>
          <p className={`text-sm font-semibold mt-0.5 ${r.part_b_score != null ? 'text-gray-800' : 'text-orange-400'}`}>
            {r.part_b_score != null ? `${r.part_b_score} / 30` : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Part C</p>
          <p className={`text-sm font-semibold mt-0.5 ${r.part_c_score != null ? 'text-gray-800' : 'text-orange-400'}`}>
            {r.part_c_score != null ? `${r.part_c_score} / 50` : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Итого</p>
          <p className="text-sm font-bold text-indigo-600 mt-0.5">
            {r.total_score != null ? `${r.total_score} / 100` : '—'}
          </p>
        </div>
        {r.level && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Уровень</p>
            <p className={`text-sm font-semibold mt-0.5 ${r.level === 'Высокий' ? 'text-green-600' : r.level === 'Средний' ? 'text-yellow-600' : 'text-red-500'}`}>
              {r.level}
            </p>
          </div>
        )}
      </div>

      {/* Blok I */}
      <Section title="Блок I. Общие сведения">
        <Row label="Вуз" value={r.university} />
        <Row label="Курс" value={r.course} />
        <Row label="Направление" value={r.direction} />
        <Row label="Контакт" value={r.contact ?? '—'} />
        <Row label="Согласие" value={r.consent ? 'Да' : 'Нет'} />
        <Row label="Волна" value={r.wave} />
        <Row label="Дата" value={new Date(r.created_at).toLocaleString('ru-RU')} />
      </Section>

      {/* Blok II */}
      <Section title="Блок II. Самооценка (Ликерт 1–5)">
        {LIKERT_STATEMENTS.map((stmt, i) => {
          const key = `b2_q${i + 1}` as keyof typeof r
          return <Row key={String(key)} label={`${i + 1}. ${stmt}`} value={r[key] ?? '—'} />
        })}
      </Section>

      {/* Blok III */}
      <Section title="Блок III. Частота использования">
        {FREQUENCY_TOOLS.map(tool => {
          const keyMap: Record<string, string> = { lms: 'b3_lms', interactive: 'b3_interactive', ai: 'b3_ai' }
          const col = keyMap[tool.key] as keyof typeof r
          return <Row key={tool.key} label={tool.label} value={r[col] ?? '—'} />
        })}
      </Section>

      {/* Blok IV */}
      <Section title="Блок IV. Затруднения">
        {DIFFICULTY_OPTIONS.map(opt => {
          const checked = Array.isArray(r.difficulties) && r.difficulties.includes(opt)
          return (
            <div key={opt} className="flex items-center gap-2 py-1">
              <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'}`}>
                {checked ? '✓' : ''}
              </span>
              <span className="text-sm text-gray-700">{opt}</span>
            </div>
          )
        })}
      </Section>

      {/* Blok V */}
      <Section title="Блок V. Открытый вопрос">
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.open_answer ?? '—'}</p>
      </Section>

      {/* Test Part A */}
      <Section title={`Часть А. Теоретические знания — ${r.part_a_score ?? '—'} / 20`}>
        <div className="space-y-3">
          {PART_A_QUESTIONS.map((q, i) => {
            const given = partAAnswers[q.id]
            const correct = CORRECT_ANSWERS[q.id]
            const isCorrect = given === correct
            return (
              <div key={q.id} className={`p-3 rounded-lg border text-sm ${given ? (isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50') : 'border-gray-200'}`}>
                <p className="font-medium text-gray-800 mb-1">{i + 1}. {q.text}</p>
                <p className={isCorrect ? 'text-green-700' : 'text-red-600'}>
                  Ответ: {given ?? '—'}
                </p>
                {!isCorrect && given && (
                  <p className="text-green-700 text-xs mt-0.5">Верно: {correct}</p>
                )}
              </div>
            )
          })}
        </div>
      </Section>

      {/* Test Part B */}
      <Section title="Часть Б. Применение знаний">
        <p className="text-sm text-gray-500 mb-2 italic">{r.part_b_case ? `Кейс №${r.part_b_case}` : 'Кейс №1'}</p>
        <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-200">
          {r.part_b_answer ?? '—'}
        </p>
      </Section>

      {/* Test Part C */}
      <Section title="Часть В. Практическое задание">
        {r.part_c_file_url && (
          <p className="text-sm mb-2">
            <span className="text-gray-500">Файл/ссылка: </span>
            <a href={r.part_c_file_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline break-all">
              {r.part_c_file_url}
            </a>
          </p>
        )}
        <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-200">
          {r.part_c_justification ?? '—'}
        </p>
      </Section>

      {/* Ball qo'yish formasi */}
      <Section title="Баллы">
        <ScoreForm
          id={r.id}
          partBScore={r.part_b_score}
          partCScore={r.part_c_score}
          totalScore={r.total_score}
          level={r.level}
          aiScoreB={r.ai_score_b}
          aiScoreC={r.ai_score_c}
        />
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <h2 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="flex gap-3 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 w-48 shrink-0">{label}</span>
      <span className="text-sm text-gray-800">{String(value ?? '—')}</span>
    </div>
  )
}
