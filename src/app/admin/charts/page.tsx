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
import ToolFrequencyBar from '@/components/admin/charts/ToolFrequencyBar'
import DifficultyBar from '@/components/admin/charts/DifficultyBar'
import ScoreHistogram from '@/components/admin/charts/ScoreHistogram'
import WaveGroupedBar from '@/components/admin/charts/WaveGroupedBar'
import { UNIVERSITIES, COURSES, LIKERT_STATEMENTS, FREQUENCY_TOOLS, FREQUENCY_OPTIONS, DIFFICULTY_OPTIONS } from '@/types/anketa'
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

const DIFFICULTY_SHORT: Record<string, string> = {
  'Создание собственных интерактивных заданий': 'Создание заданий',
  'Применение ИИ для подготовки уроков': 'Применение ИИ',
  'Оценивание работ учащихся в цифровой форме': 'Оценивание работ',
  'Технические проблемы (интернет, устройства)': 'Техн. проблемы',
  'Не хватает практических занятий по этой теме': 'Нехватка занятий',
}

export default async function ChartsPage({
  searchParams,
}: {
  searchParams: Promise<{ wave?: string }>
}) {
  const { wave } = await searchParams

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let baseQuery = supabase.from('respondents').select<string, any>(
    'id, university, course, level, total_score, part_a_score, part_b_score, part_c_score, part_a_answers, wave, difficulties, b3_lms, b3_interactive, b3_ai'
  )
  if (wave) baseQuery = baseQuery.eq('wave', Number(wave))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let likertQuery = supabase.from('respondents').select<string, any>(
    'id, b2_q1, b2_q2, b2_q3, b2_q4, b2_q5, b2_q6'
  )
  if (wave) likertQuery = likertQuery.eq('wave', Number(wave))

  // All-waves query for wave comparison chart (no filter)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allWavesQuery = supabase.from('respondents').select<string, any>(
    'id, university, wave, total_score, part_a_score, part_b_score, part_c_score'
  )

  const [
    { data: baseData, error: baseError },
    { data: likertRaw },
    { data: allWavesRaw },
  ] = await Promise.all([baseQuery, likertQuery, allWavesQuery])

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

  // All-waves rows (for wave comparison)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allWavesRows = (allWavesRaw ?? []).map((r: any) => {
    if (r.part_b_score != null && r.part_c_score != null) {
      const t = Math.round(((r.part_a_score ?? 0) + r.part_b_score + r.part_c_score) * 100) / 100
      return { ...r, total_score: r.total_score ?? t }
    }
    return r
  }) as any[]

  // ── Диаграмма 1 — Часть А по университетам ──────────────────────────
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

  // ── Диаграмма 1б — сложность вопросов ──────────────────────────────
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

  // ── Диаграмма 2 — Ликерт ────────────────────────────────────────────
  const likertData = LIKERT_STATEMENTS.map((label, i) => {
    const key = `b2_q${i + 1}` as keyof typeof rows[0]
    const vals = rows.map(r => r[key] as number | null).filter((v): v is number => v != null)
    const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : 0
    return { q: `B${i + 1}`, label, avg, n: vals.length }
  })

  // ── Диаграмма 3 — Частота использования инструментов ────────────────
  const colMap: Record<string, string> = { lms: 'b3_lms', interactive: 'b3_interactive', ai: 'b3_ai' }
  const toolShortLabel: Record<string, string> = { lms: 'LMS', interactive: 'Интерактив', ai: 'ИИ' }
  const toolFreqData = FREQUENCY_TOOLS.map(tool => {
    const row: Record<string, number | string> = { tool: toolShortLabel[tool.key] }
    FREQUENCY_OPTIONS.forEach(opt => {
      row[opt] = rows.filter(r => r[colMap[tool.key]] === opt).length
    })
    return row
  })

  // ── Диаграмма 4 — Трудности ──────────────────────────────────────────
  const difficultyData = DIFFICULTY_OPTIONS.map(opt => {
    const count = rows.filter(r => Array.isArray(r.difficulties) && r.difficulties.includes(opt)).length
    return {
      label: opt,
      short: DIFFICULTY_SHORT[opt] ?? opt.slice(0, 20),
      count,
      pct: rows.length ? Math.round(count / rows.length * 100) : 0,
    }
  }).sort((a, b) => b.count - a.count)

  // ── Диаграммы 5–9 (требуют оценивания) ──────────────────────────────
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

  // ── Диаграмма 10 — Гистограмма баллов ──────────────────────────────
  const SCORE_BINS = [
    { range: '0–9', min: 0, max: 10 }, { range: '10–19', min: 10, max: 20 },
    { range: '20–29', min: 20, max: 30 }, { range: '30–39', min: 30, max: 40 },
    { range: '40–49', min: 40, max: 50 }, { range: '50–59', min: 50, max: 60 },
    { range: '60–69', min: 60, max: 70 }, { range: '70–79', min: 70, max: 80 },
    { range: '80–89', min: 80, max: 90 }, { range: '90–100', min: 90, max: 101 },
  ]
  const histogramData = SCORE_BINS.map(({ range, min, max }) => ({
    range,
    count: rows.filter(r => r.total_score != null && r.total_score >= min && r.total_score < max).length,
  }))

  // ── Диаграмма 11 — Сравнение волн ──────────────────────────────────
  const waveAvgByUniv: Record<string, { w1: number[]; w2: number[] }> = {}
  allWavesRows.forEach(r => {
    if (r.total_score == null) return
    const key = shortUniv(r.university)
    if (!waveAvgByUniv[key]) waveAvgByUniv[key] = { w1: [], w2: [] }
    const w = Number(r.wave)
    if (w === 1) waveAvgByUniv[key].w1.push(r.total_score as number)
    if (w === 2) waveAvgByUniv[key].w2.push(r.total_score as number)
  })
  const allW1 = Object.values(waveAvgByUniv).flatMap(x => x.w1)
  const allW2 = Object.values(waveAvgByUniv).flatMap(x => x.w2)
  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : null
  const waveCompareData = [
    { label: 'Итого', wave1: avg(allW1), wave2: avg(allW2) },
    ...Object.entries(waveAvgByUniv).map(([label, { w1, w2 }]) => ({
      label, wave1: avg(w1), wave2: avg(w2),
    })),
  ]

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

      {/* ── 1. Часть А по университетам ── */}
      <Card
        title="1. Часть А — средний балл по университетам (макс. 20)"
        desc={
          <>
            <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
            <p>Средний балл за теоретическую часть (макс. 20) в разрезе университетов.</p>
            <p className="mt-2 font-semibold text-indigo-700">Как читать</p>
            <p>Чем выше столбец — тем лучше теоретическая подготовка студентов данного вуза.</p>
          </>
        }
      >
        <p className="text-xs text-gray-500 mb-4">
          Всего респондентов: <strong>{rows.length}</strong>
          {univPartAData.length === 0 && ' · Нет данных (тест не пройден)'}
        </p>
        <UniversityScoreBar data={univPartAData} />
      </Card>

      {/* ── 1б. Сложность вопросов ── */}
      {respondentsWithA.length > 0 && (
        <Card
          title="1б. Часть А — доля правильных ответов по вопросам"
          desc={
            <>
              <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
              <p>Процент правильных ответов на каждый из 15 вопросов теста.</p>
              <p className="mt-2 font-semibold text-indigo-700">Цветовая шкала</p>
              <ul className="space-y-1 mt-1">
                <li><span className="text-green-600 font-medium">Зелёный</span> — ≥70%</li>
                <li><span className="text-yellow-600 font-medium">Жёлтый</span> — 40–69%</li>
                <li><span className="text-red-500 font-medium">Красный</span> — &lt;40%</li>
              </ul>
              <p className="mt-2 text-gray-500">Респондентов: <strong className="text-gray-700">{respondentsWithA.length}</strong></p>
            </>
          }
        >
          <QuestionDifficultyBar data={questionData} />
        </Card>
      )}

      {/* ── 2. Ликерт ── */}
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
            <p className="mt-2 text-gray-500">Пунктир = среднее (3).</p>
          </>
        }
      >
        <p className="text-xs text-gray-500 mb-4">Респондентов: <strong>{rows.length}</strong></p>
        <LikertAvgBar data={likertData} />
      </Card>

      {/* ── 3. Частота использования инструментов ── */}
      <Card
        title="3. Частота использования цифровых инструментов"
        desc={
          <>
            <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
            <p>Как часто студенты используют три типа цифровых инструментов: LMS, интерактивные платформы и ИИ.</p>
            <p className="mt-2 font-semibold text-indigo-700">Цветовая шкала</p>
            <ul className="space-y-1 mt-1">
              <li><span className="text-green-600 font-medium">Зелёный</span> — каждый день</li>
              <li><span className="font-medium" style={{color:'#6366f1'}}>Индиго</span> — нескол. раз/нед.</li>
              <li><span className="text-orange-500 font-medium">Оранжевый</span> — редко</li>
              <li><span className="text-red-500 font-medium">Красный</span> — никогда</li>
            </ul>
            <p className="mt-2">Высота столбца = общее число ответивших.</p>
          </>
        }
      >
        <p className="text-xs text-gray-500 mb-4">Респондентов: <strong>{rows.length}</strong></p>
        <ToolFrequencyBar data={toolFreqData} />
      </Card>

      {/* ── 4. Трудности ── */}
      <Card
        title="4. Затруднения студентов при работе с цифровыми инструментами"
        desc={
          <>
            <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
            <p>Какие затруднения студенты отмечают чаще всего (можно было выбрать несколько).</p>
            <p className="mt-2 font-semibold text-indigo-700">Как читать</p>
            <p>Диаграмма отсортирована по убыванию. Чем длиннее полоса — тем проблема актуальнее.</p>
            <p className="mt-2 text-gray-500">Респондентов: <strong className="text-gray-700">{rows.length}</strong></p>
          </>
        }
      >
        <DifficultyBar data={difficultyData} />
      </Card>

      {/* ── Баннер: нужно оценивание ── */}
      {univScoreData.length === 0 && (
        <ScoringNeeded total={rows.length} />
      )}

      {univScoreData.length > 0 && (
        <>
          {/* ── 5. Итоговый балл по университетам ── */}
          <Card
            title="5. Средний итоговый балл по университетам (0–100)"
            desc={
              <>
                <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
                <p>Итоговый средний балл (А+Б+В, макс. 100) по каждому университету.</p>
                <p className="mt-2 font-semibold text-indigo-700">Примечание</p>
                <p>Учтены только студенты, чьи работы уже проверены.</p>
                <p className="mt-2 font-semibold text-indigo-700">Уровни</p>
                <ul className="space-y-1 mt-1">
                  <li>≥80 — Высокий</li>
                  <li>50–79 — Средний</li>
                  <li>&lt;50 — Низкий</li>
                </ul>
              </>
            }
          >
            <p className="text-xs text-gray-500 mb-4">Учтены только оценённые респонденты.</p>
            <UniversityScoreBar data={univScoreData} />
          </Card>

          {/* ── 6. Уровни ── */}
          <Card
            title="6. Распределение по уровням компетентности — в разрезе университетов"
            desc={
              <>
                <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
                <p>Количество студентов каждого уровня по университетам.</p>
                <p className="mt-2 font-semibold text-indigo-700">Цветовая шкала</p>
                <ul className="space-y-1 mt-1">
                  <li><span className="text-green-600 font-medium">Зелёный</span> — Высокий (≥80)</li>
                  <li><span className="text-yellow-500 font-medium">Жёлтый</span> — Средний (50–79)</li>
                  <li><span className="text-red-500 font-medium">Красный</span> — Низкий (&lt;50)</li>
                </ul>
              </>
            }
          >
            <p className="text-xs text-gray-500 mb-4">Накопительный столбец по университетам.</p>
            <LevelStackedBar data={levelData} />
          </Card>

          {/* ── 7. Корреляция ── */}
          <Card
            title="7. Корреляция: самооценка vs реальный результат теста"
            desc={
              <>
                <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
                <p>Связь между самооценкой (ось X) и итоговым баллом (ось Y).</p>
                <p className="mt-2 font-semibold text-indigo-700">Как читать</p>
                <p>Если точки тянутся по диагонали — самооценка точная. Точки выше диагонали: результат лучше самооценки (недооценка).</p>
                <p className="mt-2">Цвет — уровень компетентности.</p>
              </>
            }
          >
            <p className="text-xs text-gray-500 mb-4">Каждая точка — один респондент.</p>
            <SelfVsActualScatter data={scatterData} />
          </Card>

          {/* ── 8. Баллы по частям ── */}
          <Card
            title="8. Средние баллы по частям — в разрезе университетов"
            desc={
              <>
                <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
                <p>Средние баллы по трём частям инструмента.</p>
                <p className="mt-2 font-semibold text-indigo-700">Части</p>
                <ul className="space-y-1 mt-1">
                  <li><span className="font-medium" style={{color:'#6366f1'}}>А</span> — Теория (макс. 20)</li>
                  <li><span className="font-medium" style={{color:'#f97316'}}>Б</span> — Кейс (макс. 30)</li>
                  <li><span className="font-medium" style={{color:'#14b8a6'}}>В</span> — Задание (макс. 50)</li>
                </ul>
                <p className="mt-2">Позволяет выявить проблемные части у каждого вуза.</p>
              </>
            }
          >
            <p className="text-xs text-gray-500 mb-4">Часть А (макс. 20), Б (макс. 30), В (макс. 50).</p>
            <PartScoresBar data={partData} />
          </Card>

          {/* ── 9. Баллы по курсам ── */}
          <Card
            title="9. Средний итоговый балл по курсам (0–100)"
            desc={
              <>
                <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
                <p>Сравнение результатов студентов разных курсов.</p>
                <p className="mt-2 font-semibold text-indigo-700">Как использовать</p>
                <p>Позволяет выявить динамику компетентности: растёт ли она от 3 курса к магистратуре 2.</p>
              </>
            }
          >
            <p className="text-xs text-gray-500 mb-4">Бакалавр 3–4 курс, Магистратура 1–2 курс.</p>
            <CourseScoreBar data={courseData} />
          </Card>

          {/* ── 10. Гистограмма баллов ── */}
          <Card
            title="10. Гистограмма распределения итоговых баллов"
            desc={
              <>
                <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
                <p>Сколько студентов набрало баллы в каждом диапазоне (0–9, 10–19, … 90–100).</p>
                <p className="mt-2 font-semibold text-indigo-700">Цветовая шкала</p>
                <ul className="space-y-1 mt-1">
                  <li><span className="text-green-600 font-medium">Зелёный</span> — ≥80 (высокий)</li>
                  <li><span className="text-yellow-500 font-medium">Жёлтый</span> — 50–79 (средний)</li>
                  <li><span className="text-red-500 font-medium">Красный</span> — &lt;50 (низкий)</li>
                </ul>
                <p className="mt-2">Удобно для описания выборки в диссертации.</p>
              </>
            }
          >
            <p className="text-xs text-gray-500 mb-4">Оценённых респондентов: <strong>{rows.filter(r => r.total_score != null).length}</strong></p>
            <ScoreHistogram data={histogramData} />
          </Card>
        </>
      )}

      {/* ── 11. Сравнение волн ── */}
      <Card
        title="11. Сравнение Волны 1 и Волны 2 — средний итоговый балл"
        desc={
          <>
            <p className="font-semibold text-indigo-700 mb-1">Что показывает</p>
            <p>Изменился ли средний итоговый балл между двумя волнами исследования.</p>
            <p className="mt-2 font-semibold text-indigo-700">Как читать</p>
            <p>Если синий столбец (Волна 2) выше фиолетового (Волна 1) — компетентность студентов выросла.</p>
            <p className="mt-2 font-semibold text-indigo-700">Примечание</p>
            <p>Диаграмма не зависит от фильтра волн — показывает обе волны всегда.</p>
            {allW2.length === 0 && (
              <p className="mt-2 text-amber-600 font-medium">Волна 2 ещё не проведена — данные появятся после второго опроса.</p>
            )}
          </>
        }
      >
        <p className="text-xs text-gray-500 mb-4">
          Волна 1: <strong>{allW1.length}</strong> оценённых · Волна 2: <strong>{allW2.length}</strong> оценённых
        </p>
        <WaveGroupedBar data={waveCompareData} yMax={100} />
      </Card>
    </div>
  )
}

function ScoringNeeded({ total }: { total: number }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
      <p className="text-sm font-semibold text-amber-800 mb-1">
        Диаграммы 5–10 появятся после оценивания
      </p>
      <p className="text-xs text-amber-600">
        Всего респондентов: <strong>{total}</strong>.
        После проверки частей Б и В автоматически откроются диаграммы 5–10.
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
