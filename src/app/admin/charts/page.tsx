import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import WaveFilter from '@/components/admin/WaveFilter'
import UniversityScoreBar from '@/components/admin/charts/UniversityScoreBar'
import LevelStackedBar from '@/components/admin/charts/LevelStackedBar'
import SelfVsActualScatter from '@/components/admin/charts/SelfVsActualScatter'
import PartScoresBar from '@/components/admin/charts/PartScoresBar'
import CourseScoreBar from '@/components/admin/charts/CourseScoreBar'
import QuestionDifficultyBar from '@/components/admin/charts/QuestionDifficultyBar'
import LikertAvgBar from '@/components/admin/charts/LikertAvgBar'
import { UNIVERSITIES, COURSES, LIKERT_STATEMENTS } from '@/types/anketa'
import { PART_A_QUESTIONS } from '@/types/test'

export const metadata: Metadata = { title: 'Diagrammalar | Admin' }
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const UNIV_SHORT: Record<string, string> = {
  [UNIVERSITIES[0]]: 'УзГУМЯ',
  [UNIVERSITIES[1]]: 'ТГПУ им. Низами',
  [UNIVERSITIES[2]]: 'Чирчикский ГПУ',
  [UNIVERSITIES[3]]: 'Нукусский ГПИ',
}

function shortUniv(name: string | null): string {
  if (!name) return "Noma'lum"
  return UNIV_SHORT[name] ?? name.slice(0, 18)
}

export default async function ChartsPage({
  searchParams,
}: {
  searchParams: Promise<{ wave?: string }>
}) {
  const { wave } = await searchParams

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = supabase.from('respondents').select<string, any>(
    'university, level, total_score, part_a_score, part_b_score, part_c_score, ' +
    'b2_q1, b2_q2, b2_q3, b2_q4, b2_q5, b2_q6, part_a_answers, course'
  )
  if (wave) query = query.eq('wave', Number(wave))

  const { data } = await query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []).map((r: any) => {
    if (r.part_b_score != null && r.part_c_score != null) {
      const t = Math.round(((r.part_a_score ?? 0) + r.part_b_score + r.part_c_score) * 100) / 100
      return {
        ...r,
        total_score: r.total_score ?? t,
        level: r.level ?? (t >= 80 ? 'Высокий' : t >= 50 ? 'Средний' : 'Низкий'),
      }
    }
    return r
  }) as any[]

  // --- 1. Univers bo'yicha o'rtacha umumiy ball ---
  const univScoreMap: Record<string, number[]> = {}
  rows.forEach(r => {
    if (r.total_score == null) return
    const key = shortUniv(r.university)
    if (!univScoreMap[key]) univScoreMap[key] = []
    univScoreMap[key].push(r.total_score as number)
  })
  const univScoreData = Object.entries(univScoreMap).map(([univ, scores]) => ({
    univ,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10,
    count: scores.length,
  }))

  // --- 2. Darajalar taqsimoti ---
  const levelMap: Record<string, Record<string, number>> = {}
  rows.forEach(r => {
    if (!r.level) return
    const key = shortUniv(r.university)
    if (!levelMap[key]) levelMap[key] = { 'Высокий': 0, 'Средний': 0, 'Низкий': 0 }
    levelMap[key][r.level as string] = (levelMap[key][r.level as string] ?? 0) + 1
  })
  const levelData = Object.entries(levelMap).map(([univ, levels]) => ({ univ, ...levels }))

  // --- 3. O'z-o'zini baholash vs test natijasi ---
  const scatterData = rows
    .filter(r => r.total_score != null)
    .map(r => {
      const vals = [r.b2_q1, r.b2_q2, r.b2_q3, r.b2_q4, r.b2_q5, r.b2_q6]
        .filter((v): v is number => v != null)
      if (vals.length === 0) return null
      const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10
      return { x: avg, y: r.total_score as number, univ: shortUniv(r.university), level: r.level ?? '—' }
    })
    .filter(Boolean) as { x: number; y: number; univ: string; level: string }[]

  // --- 4. Qismlar bo'yicha o'rtacha ball ---
  const partMap: Record<string, { a: number[]; b: number[]; c: number[] }> = {}
  rows.forEach(r => {
    const key = shortUniv(r.university)
    if (!partMap[key]) partMap[key] = { a: [], b: [], c: [] }
    if (r.part_a_score != null) partMap[key].a.push(r.part_a_score as number)
    if (r.part_b_score != null) partMap[key].b.push(r.part_b_score as number)
    if (r.part_c_score != null) partMap[key].c.push(r.part_c_score as number)
  })
  const partData = Object.entries(partMap).map(([univ, { a, b, c }]) => ({
    univ,
    partA: a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length * 10) / 10 : 0,
    partB: b.length ? Math.round(b.reduce((x, y) => x + y, 0) / b.length * 10) / 10 : 0,
    partC: c.length ? Math.round(c.reduce((x, y) => x + y, 0) / c.length * 10) / 10 : 0,
  }))

  // --- 5. Kurs bo'yicha o'rtacha umumiy ball ---
  const courseScoreMap: Record<string, number[]> = {}
  COURSES.forEach(c => { courseScoreMap[c] = [] })
  rows.forEach(r => {
    if (r.total_score == null || !r.course) return
    if (!courseScoreMap[r.course as string]) courseScoreMap[r.course as string] = []
    courseScoreMap[r.course as string].push(r.total_score as number)
  })
  const courseData = Object.entries(courseScoreMap)
    .filter(([, scores]) => scores.length > 0)
    .map(([course, scores]) => ({
      course,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10,
      count: scores.length,
    }))

  // --- 6. Likert — har bir savol bo'yicha o'rtacha ---
  const likertData = LIKERT_STATEMENTS.map((label, i) => {
    const key = `b2_q${i + 1}` as keyof typeof rows[0]
    const vals = rows.map(r => r[key] as number | null).filter((v): v is number => v != null)
    const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : 0
    return { q: `B${i + 1}`, label, avg, n: vals.length }
  })

  // --- 7. Part A — savol bo'yicha to'g'ri javob foizi ---
  const CORRECT_ANSWERS: Record<string, string> = {
    q1: 'Система управления обучением', q2: 'Moodle', q3: 'Мастерская (Workshop)',
    q4: 'Google', q5: 'GIFT/XML', q6: 'Искусственный интеллект', q7: 'ChatGPT',
    q8: 'Текстовый запрос пользователя к ИИ', q9: 'Уверенная генерация недостоверной информации',
    q10: 'Kahoot', q11: 'Электронных карточках с адаптивным повторением',
    q12: 'Сочетание очных занятий и онлайн-компонента', q13: 'Проверка грамматики и стиля текста',
    q14: 'Отслеживание прогресса и активности студентов',
    q15: 'Использование ИИ следует декларировать, сохраняя авторскую ответственность',
  }
  const respondentsWithA = rows.filter(r => r.part_a_answers && typeof r.part_a_answers === 'object')
  const questionData = PART_A_QUESTIONS.map(q => {
    const total   = respondentsWithA.length
    const correct = respondentsWithA.filter(r => r.part_a_answers[q.id] === CORRECT_ANSWERS[q.id]).length
    const pct     = total > 0 ? Math.round((correct / total) * 100) : 0
    return { q: q.id.replace('q', 'S'), label: q.text, pct, correct, total }
  })

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Diagrammalar</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Jami respondentlar: <strong>{rows.length}</strong>
          </p>
        </div>
        <WaveFilter defaultValue={wave ?? ''} basePath="/admin/charts" />
      </div>

      {/* === HOZIR ISHLAYDI: scoring talab etmaydi === */}
      <Card title="1. Part A — savol bo'yicha to'g'ri javob foizi">
        <p className="text-xs text-gray-500 mb-4">
          Har bir satr — bitta test savoli. Yashil ≥70%, sariq 40–69%, qizil &lt;40%.
          Jami respondentlar: <strong>{respondentsWithA.length}</strong>
        </p>
        <QuestionDifficultyBar data={questionData} />
      </Card>

      <Card title="2. O'z-o'zini baholash (Likert 1–5) — savol bo'yicha o'rtacha">
        <p className="text-xs text-gray-500 mb-4">
          Indigo ≥4 (yuqori), binafsha 3–4 (o'rta), qizil &lt;3 (past). Respondentlar: <strong>{rows.length}</strong>
        </p>
        <LikertAvgBar data={likertData} />
      </Card>

      {/* === BAHOLASH KERAK === */}
      {univScoreData.length === 0 && (
        <ScoringNeeded scored={0} total={rows.length} />
      )}

      {univScoreData.length > 0 && (
        <>
          <Card title="3. Universitetlar bo'yicha o'rtacha umumiy ball (0–100)">
            <p className="text-xs text-gray-500 mb-4">
              Faqat B va V qismlari baholangan respondentlar hisobga olingan.
            </p>
            <UniversityScoreBar data={univScoreData} />
          </Card>

          <Card title="4. Darajalar taqsimoti — universitetlar kesimi">
            <p className="text-xs text-gray-500 mb-4">
              Har bir stacked ustun bir universitetdagi baholangan respondentlar soni.
            </p>
            <LevelStackedBar data={levelData} />
          </Card>

          <Card title="5. O'z-o'zini baholash vs test natijasi korrelyatsiyasi">
            <p className="text-xs text-gray-500 mb-4">
              Har bir nuqta — bir respondent. X o'qi — Likert o'rtachasi. Y o'qi — umumiy test bali.
            </p>
            <SelfVsActualScatter data={scatterData} />
          </Card>

          <Card title="6. Test qismlari bo'yicha o'rtacha ball — universitetlar kesimi">
            <p className="text-xs text-gray-500 mb-4">
              A qismi — nazariy (max 20), B qismi — keys (max 30), V qismi — amaliy topshiriq (max 50).
            </p>
            <PartScoresBar data={partData} />
          </Card>

          <Card title="7. Kurs bo'yicha o'rtacha umumiy ball (0–100)">
            <p className="text-xs text-gray-500 mb-4">
              3-kurs, 4-kurs va magistratura talabalari natijalarini solishtirish.
            </p>
            <CourseScoreBar data={courseData} />
          </Card>
        </>
      )}
    </div>
  )
}

function ScoringNeeded({ scored, total }: { scored: number; total: number }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
      <p className="text-sm font-semibold text-amber-800 mb-1">
        Qolgan diagrammalar baholashdan keyin ko'rinadi
      </p>
      <p className="text-xs text-amber-600">
        Hozir baholangan: <strong>{scored}</strong> / {total} ta respondent.
        Respondent baholab bo'linganidan keyin 3–7 ta qo'shimcha diagramma avtomatik paydo bo'ladi.
      </p>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-1 pb-2 border-b border-gray-100">
        {title}
      </h2>
      {children}
    </div>
  )
}
