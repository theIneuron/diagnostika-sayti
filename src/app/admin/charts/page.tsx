import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import React from 'react'
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

export const metadata: Metadata = { title: 'Диаграммы | ДиагКомп-Рус' }
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const UNIV_SHORT: Record<string, string> = {
  [UNIVERSITIES[0]]: 'УзГУМЯ',
  [UNIVERSITIES[1]]: 'НПУ им. Низами',
  [UNIVERSITIES[2]]: 'ФерГУ',
  [UNIVERSITIES[3]]: 'БухГУ',
}

function shortUniv(name: string | null): string {
  if (!name) return 'Неизвестный'
  return UNIV_SHORT[name] ?? name.slice(0, 18)
}

export default async function ChartsPage({
  searchParams,
}: {
  searchParams: Promise<{ wave?: string }>
}) {
  const { wave } = await searchParams

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let baseQuery = supabase.from('respondents').select<string, any>(
    'id, university, course, level, total_score, part_a_score, part_b_score, part_c_score, part_a_answers'
  )
  if (wave) baseQuery = baseQuery.eq('wave', Number(wave))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let likertQuery = supabase.from('respondents').select<string, any>(
    'id, b2_q1, b2_q2, b2_q3, b2_q4, b2_q5, b2_q6'
  )
  if (wave) likertQuery = likertQuery.eq('wave', Number(wave))

  const [{ data: baseData, error: baseError }, { data: likertRaw }] = await Promise.all([
    baseQuery,
    likertQuery,
  ])

  if (baseError) {
    return (
      <div className="max-w-6xl">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Диаграммы</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-red-700 mb-1">Ошибка Supabase (SELECT)</p>
          <pre className="text-xs text-red-600 whitespace-pre-wrap">{JSON.stringify(baseError, null, 2)}</pre>
          <p className="text-xs text-red-500 mt-2">
            Откройте Supabase SQL Editor и добавьте политику SELECT:<br />
            <code>CREATE POLICY &quot;anon_select&quot; ON respondents FOR SELECT TO anon USING (true);</code>
          </p>
        </div>
      </div>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const likertById: Record<string, any> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(likertRaw ?? []).forEach((r: any) => { likertById[r.id] = r })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (baseData ?? []).map((r: any) => {
    const lk = likertById[r.id] ?? {}
    const merged = { ...r, ...lk }
    if (merged.part_b_score != null && merged.part_c_score != null) {
      const t = Math.round(((merged.part_a_score ?? 0) + merged.part_b_score + merged.part_c_score) * 100) / 100
      return {
        ...merged,
        total_score: merged.total_score ?? t,
        level: merged.level ?? (t >= 80 ? 'Высокий' : t >= 50 ? 'Средний' : 'Низкий'),
      }
    }
    return merged
  }) as any[]

  // Диаграмма 1 — Часть А по университетам
  const univPartAMap: Record<string, number[]> = {}
  rows.forEach(r => {
    if (r.part_a_score == null) return
    const key = shortUniv(r.university)
    if (!univPartAMap[key]) univPartAMap[key] = []
    univPartAMap[key].push(r.part_a_score as number)
  })
  const univPartAData = Object.entries(univPartAMap).map(([univ, scores]) => ({
    univ,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10,
    count: scores.length,
  }))

  // Диаграмма 1б — сложность вопросов
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

  // Диаграмма 2 — Ликерт
  const likertData = LIKERT_STATEMENTS.map((label, i) => {
    const key = `b2_q${i + 1}` as keyof typeof rows[0]
    const vals = rows.map(r => r[key] as number | null).filter((v): v is number => v != null)
    const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : 0
    return { q: `B${i + 1}`, label, avg, n: vals.length }
  })

  // Диаграммы 3–7 — требуют оценивания
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

  const levelMap: Record<string, Record<string, number>> = {}
  rows.forEach(r => {
    if (!r.level) return
    const key = shortUniv(r.university)
    if (!levelMap[key]) levelMap[key] = { 'Высокий': 0, 'Средний': 0, 'Низкий': 0 }
    levelMap[key][r.level as string] = (levelMap[key][r.level as string] ?? 0) + 1
  })
  const levelData = Object.entries(levelMap).map(([univ, levels]) => ({ univ, ...levels }))

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

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Диаграммы</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Всего респондентов: <strong>{rows.length}</strong>
          </p>
        </div>
        <WaveFilter defaultValue={wave ?? ''} basePath="/admin/charts" />
      </div>

      <Card
        title="1. Часть А — средний балл по университетам (макс. 20)"
        desc={
          <>
            <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
            <p>Средний балл за теоретическую часть (часть А, макс. 20 баллов) в разрезе университетов.</p>
            <p className="mt-2 font-semibold text-indigo-700">Как читать</p>
            <p>Чем выше столбец — тем лучше теоретическая подготовка студентов данного вуза. Позволяет сравнить уровень знаний между университетами.</p>
          </>
        }
      >
        <p className="text-xs text-gray-500 mb-4">
          Всего респондентов: <strong>{rows.length}</strong>
          {univPartAData.length === 0 && ' · Нет данных по части А (тест не пройден)'}
        </p>
        <UniversityScoreBar data={univPartAData} />
      </Card>

      {respondentsWithA.length > 0 && (
        <Card
          title="1б. Часть А — доля правильных ответов по вопросам"
          desc={
            <>
              <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
              <p>Процент правильных ответов на каждый из 15 вопросов теста.</p>
              <p className="mt-2 font-semibold text-indigo-700">Цветовая шкала</p>
              <ul className="space-y-1 mt-1">
                <li><span className="text-green-600 font-medium">Зелёный</span> — ≥70% (лёгкий)</li>
                <li><span className="text-yellow-600 font-medium">Жёлтый</span> — 40–69% (средний)</li>
                <li><span className="text-red-500 font-medium">Красный</span> — &lt;40% (трудный)</li>
              </ul>
              <p className="mt-2 text-gray-500">Респондентов: <strong className="text-gray-700">{respondentsWithA.length}</strong></p>
            </>
          }
        >
          <QuestionDifficultyBar data={questionData} />
        </Card>
      )}

      <Card
        title="2. Самооценка цифровых компетенций (шкала Ликерта 1–5)"
        desc={
          <>
            <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
            <p>Средний балл самооценки по каждому из 6 утверждений блока Б.</p>
            <p className="mt-2 font-semibold text-indigo-700">Цветовая шкала</p>
            <ul className="space-y-1 mt-1">
              <li><span className="font-medium" style={{color:'#6366f1'}}>Индиго</span> — ≥4 (высокий)</li>
              <li><span className="font-medium" style={{color:'#a78bfa'}}>Фиолетовый</span> — 3–4 (средний)</li>
              <li><span className="text-red-400 font-medium">Красный</span> — &lt;3 (низкий)</li>
            </ul>
            <p className="mt-2">Пунктирная линия = 3 (среднее значение шкалы).</p>
            <p className="mt-1 text-gray-500">Респондентов: <strong className="text-gray-700">{rows.length}</strong></p>
          </>
        }
      >
        <LikertAvgBar data={likertData} />
      </Card>

      {univScoreData.length === 0 && (
        <ScoringNeeded scored={0} total={rows.length} />
      )}

      {univScoreData.length > 0 && (
        <>
          <Card
            title="3. Средний итоговый балл по университетам (0–100)"
            desc={
              <>
                <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
                <p>Итоговый средний балл (части А+Б+В, макс. 100) по каждому университету.</p>
                <p className="mt-2 font-semibold text-indigo-700">Примечание</p>
                <p>Учтены только студенты, чьи работы уже проверены (оценены части Б и В).</p>
                <p className="mt-2 font-semibold text-indigo-700">Пороговые значения</p>
                <ul className="space-y-1 mt-1">
                  <li>≥80 — Высокий уровень</li>
                  <li>50–79 — Средний уровень</li>
                  <li>&lt;50 — Низкий уровень</li>
                </ul>
              </>
            }
          >
            <p className="text-xs text-gray-500 mb-4">
              Учтены только оценённые по частям Б и В респонденты.
            </p>
            <UniversityScoreBar data={univScoreData} />
          </Card>

          <Card
            title="4. Распределение по уровням компетентности — в разрезе университетов"
            desc={
              <>
                <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
                <p>Количество студентов каждого уровня (Высокий / Средний / Низкий) по университетам.</p>
                <p className="mt-2 font-semibold text-indigo-700">Цветовая шкала</p>
                <ul className="space-y-1 mt-1">
                  <li><span className="text-green-600 font-medium">Зелёный</span> — Высокий (≥80)</li>
                  <li><span className="text-yellow-500 font-medium">Жёлтый</span> — Средний (50–79)</li>
                  <li><span className="text-red-500 font-medium">Красный</span> — Низкий (&lt;50)</li>
                </ul>
                <p className="mt-2">Столбцы — накопительные (stacked), высота = общее число оценённых студентов вуза.</p>
              </>
            }
          >
            <p className="text-xs text-gray-500 mb-4">
              Каждый столбец — количество оценённых респондентов одного университета.
            </p>
            <LevelStackedBar data={levelData} />
          </Card>

          <Card
            title="5. Корреляция: самооценка vs реальный результат теста"
            desc={
              <>
                <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
                <p>Связь между самооценкой (шкала Ликерта, ось X) и итоговым баллом (ось Y).</p>
                <p className="mt-2 font-semibold text-indigo-700">Как читать</p>
                <p>Каждая точка — один респондент. Если точки расположены по диагонали снизу-слева вверх-вправо — самооценка совпадает с реальными результатами.</p>
                <p className="mt-2">Цвет точки — уровень компетентности.</p>
              </>
            }
          >
            <p className="text-xs text-gray-500 mb-4">
              Каждая точка — один респондент. Ось X — среднее по шкале Ликерта. Ось Y — итоговый балл теста.
            </p>
            <SelfVsActualScatter data={scatterData} />
          </Card>

          <Card
            title="6. Средние баллы по частям — в разрезе университетов"
            desc={
              <>
                <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
                <p>Сравнение средних баллов по трём частям инструмента в разрезе университетов.</p>
                <p className="mt-2 font-semibold text-indigo-700">Части</p>
                <ul className="space-y-1 mt-1">
                  <li><span className="font-medium" style={{color:'#6366f1'}}>А</span> — Теория (макс. 20)</li>
                  <li><span className="font-medium" style={{color:'#f97316'}}>Б</span> — Кейс (макс. 30)</li>
                  <li><span className="font-medium" style={{color:'#14b8a6'}}>В</span> — Задание (макс. 50)</li>
                </ul>
                <p className="mt-2">Позволяет выявить, в какой части студенты испытывают наибольшие затруднения.</p>
              </>
            }
          >
            <p className="text-xs text-gray-500 mb-4">
              Часть А — теоретическая (макс. 20), Часть Б — кейс (макс. 30), Часть В — практическое задание (макс. 50).
            </p>
            <PartScoresBar data={partData} />
          </Card>

          <Card
            title="7. Средний итоговый балл по курсам (0–100)"
            desc={
              <>
                <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
                <p>Сравнение итоговых результатов студентов разных курсов.</p>
                <p className="mt-2 font-semibold text-indigo-700">Как использовать</p>
                <p>Позволяет выявить динамику развития цифровой компетентности: растёт ли она от 3 курса бакалавриата к магистратуре.</p>
                <p className="mt-2">Курсы: Бакалавр 3, Бакалавр 4, Магистратура 1, Магистратура 2.</p>
              </>
            }
          >
            <p className="text-xs text-gray-500 mb-4">
              Сравнение результатов по курсам: бакалавр 3–4 курс, магистратура 1–2 курс.
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
        Остальные диаграммы появятся после оценивания
      </p>
      <p className="text-xs text-amber-600">
        Оценено: <strong>{scored}</strong> / {total} респондентов.
        После оценивания автоматически появятся диаграммы 3–7.
      </p>
    </div>
  )
}

function Card({
  title,
  desc,
  children,
}: {
  title: string
  desc: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
        {title}
      </h2>
      <div className="flex gap-5">
        <div className="flex-1 min-w-0">{children}</div>
        <aside className="w-56 shrink-0 bg-indigo-50 rounded-lg p-4 border border-indigo-100 text-xs text-gray-700 space-y-1 self-start leading-relaxed">
          {desc}
        </aside>
      </div>
    </div>
  )
}
