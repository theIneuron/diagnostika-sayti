import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import Link from 'next/link'
import { LIKERT_STATEMENTS, DIFFICULTY_OPTIONS, FREQUENCY_TOOLS, FREQUENCY_OPTIONS } from '@/types/anketa'
import WaveFilter from '@/components/admin/WaveFilter'

export const metadata: Metadata = { title: 'Статистика | ДиагКомп-Рус' }
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const LEVEL_COLOR: Record<string, string> = {
  'Высокий': 'bg-green-500',
  'Средний': 'bg-yellow-400',
  'Низкий':  'bg-red-400',
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ wave?: string }>
}) {
  const { wave } = await searchParams

  let query = supabase.from('respondents').select(
    'wave, university, course, level, total_score, part_a_score, part_b_score, part_c_score, ' +
    'b2_q1, b2_q2, b2_q3, b2_q4, b2_q5, b2_q6, ' +
    'b3_lms, b3_interactive, b3_ai, ' +
    'difficulties'
  )
  if (wave) query = query.eq('wave', Number(wave))

  const { data, error: fetchError } = await query
  if (fetchError) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Статистика</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-red-700 mb-1">Ошибка Supabase</p>
          <pre className="text-xs text-red-600 whitespace-pre-wrap">{JSON.stringify(fetchError, null, 2)}</pre>
        </div>
      </div>
    )
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []).map((r: any) => {
    // generated column level/total_score null bo'lsa JS da hisoblaymiz
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
  const total = rows.length

  // --- 1. Daraja taqsimoti ---
  const levelMap: Record<string, number> = { 'Высокий': 0, 'Средний': 0, 'Низкий': 0 }
  let unscored = 0
  rows.forEach(r => {
    const lv = r.level as string | null
    if (lv && levelMap[lv] !== undefined) levelMap[lv]++
    else unscored++
  })

  // --- 2. Blok II o'rtacha balllar ---
  const b2Avgs = LIKERT_STATEMENTS.map((stmt, i) => {
    const key = `b2_q${i + 1}`
    const vals = rows.map(r => r[key] as number | null | undefined).filter((v): v is number => v != null)
    const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
    return { stmt, avg: Math.round(avg * 100) / 100, count: vals.length }
  })

  // --- 3. Blok IV qiyinchiliklar ---
  const diffStats = DIFFICULTY_OPTIONS.map(opt => {
    const count = rows.filter(r => Array.isArray(r.difficulties) && (r.difficulties as string[]).includes(opt)).length
    return { opt, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }
  })

  // --- 3b. Blok III chastota ---
  const colMap: Record<string, string> = { lms: 'b3_lms', interactive: 'b3_interactive', ai: 'b3_ai' }
  const freqStats = FREQUENCY_TOOLS.map(tool => {
    const col = colMap[tool.key]
    const dist = FREQUENCY_OPTIONS.map(opt => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const count = rows.filter((r: any) => r[col] === opt).length
      return { opt, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }
    })
    return { tool, dist }
  })

  // --- 4. O'rtacha umumiy ball ---
  const scoredRows = rows.filter(r => r.total_score != null)
  const avgTotal = scoredRows.length > 0
    ? Math.round(scoredRows.reduce((a, r) => a + (r.total_score as number), 0) / scoredRows.length * 10) / 10
    : null

  // --- 5. Tavsifiy statistika ---
  function descStats(nums: number[]) {
    if (nums.length === 0) return null
    const n = nums.length
    const mean = nums.reduce((a, b) => a + b, 0) / n
    const sorted = [...nums].sort((a, b) => a - b)
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)]
    const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n > 1 ? n - 1 : 1)
    return {
      n,
      min: Math.round(sorted[0] * 10) / 10,
      max: Math.round(sorted[n - 1] * 10) / 10,
      mean: Math.round(mean * 10) / 10,
      sd: Math.round(Math.sqrt(variance) * 100) / 100,
      median: Math.round(median * 10) / 10,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getScores(arr: any[], col: string): number[] {
    return arr.map(r => r[col]).filter((v): v is number => v != null)
  }

  const allScored = rows.filter(r => r.part_b_score != null && r.part_c_score != null)

  const descTable = [
    { label: 'Часть А (макс. 20)', a: descStats(getScores(rows, 'part_a_score')) },
    { label: 'Часть Б (макс. 30)', a: descStats(getScores(allScored, 'part_b_score')) },
    { label: 'Часть В (макс. 50)', a: descStats(getScores(allScored, 'part_c_score')) },
    { label: 'Итого (макс. 100)',  a: descStats(getScores(allScored, 'total_score')) },
  ]

  // --- 6. Cronbach's alpha (Likert, 6 ta element) ---
  function cronbachAlpha(matrix: number[][]): number | null {
    const k = matrix.length
    if (k < 2) return null
    const n = matrix[0].length
    if (n < 2) return null
    const itemVars = matrix.map(col => {
      const m = col.reduce((a, b) => a + b, 0) / n
      return col.reduce((a, b) => a + Math.pow(b - m, 2), 0) / (n - 1)
    })
    const totals = Array.from({ length: n }, (_, i) => matrix.reduce((s, col) => s + col[i], 0))
    const totalMean = totals.reduce((a, b) => a + b, 0) / n
    const totalVar = totals.reduce((a, b) => a + Math.pow(b - totalMean, 2), 0) / (n - 1)
    if (totalVar === 0) return null
    const alpha = (k / (k - 1)) * (1 - itemVars.reduce((a, b) => a + b, 0) / totalVar)
    return Math.round(alpha * 1000) / 1000
  }

  const likertMatrix = [1, 2, 3, 4, 5, 6].map(i => {
    const key = `b2_q${i}`
    return rows.map(r => r[key] as number | null).filter((v): v is number => v != null)
  })
  const minLen = Math.min(...likertMatrix.map(col => col.length))
  const alpha = minLen >= 2
    ? cronbachAlpha(likertMatrix.map(col => col.slice(0, minLen)))
    : null

  function alphaLabel(a: number) {
    if (a >= 0.9) return 'Отлично (≥0.90)'
    if (a >= 0.8) return 'Хорошо (0.80–0.89)'
    if (a >= 0.7) return 'Приемлемо (0.70–0.79)'
    if (a >= 0.6) return 'Сомнительно (0.60–0.69)'
    return 'Неудовлетворительно (<0.60)'
  }

  // --- 7. Pearson korrelyatsiya (Likert o'rtachasi vs Part A/B/C/Jami) ---
  function pearson(x: number[], y: number[]): number | null {
    const n2 = Math.min(x.length, y.length)
    if (n2 < 3) return null
    const mx = x.slice(0, n2).reduce((a, b) => a + b, 0) / n2
    const my = y.slice(0, n2).reduce((a, b) => a + b, 0) / n2
    let num = 0, dx = 0, dy = 0
    for (let i = 0; i < n2; i++) {
      num += (x[i] - mx) * (y[i] - my)
      dx  += Math.pow(x[i] - mx, 2)
      dy  += Math.pow(y[i] - my, 2)
    }
    if (dx === 0 || dy === 0) return null
    return Math.round((num / Math.sqrt(dx * dy)) * 1000) / 1000
  }

  // Likert o'rtachasi har bir respondent uchun
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function likertAvg(r: any): number | null {
    const vals = [1,2,3,4,5,6].map(i => r[`b2_q${i}`] as number | null).filter((v): v is number => v != null)
    return vals.length === 6 ? Math.round(vals.reduce((a,b)=>a+b,0)/6*100)/100 : null
  }

  const corrRows = allScored.filter(r => likertAvg(r) != null)
  const likertAvgs = corrRows.map(r => likertAvg(r) as number)

  const corrTable = [
    { label: 'Part A',    r: pearson(likertAvgs, corrRows.map(r => r.part_a_score ?? 0)) },
    { label: 'Part B',    r: pearson(likertAvgs, corrRows.map(r => r.part_b_score as number)) },
    { label: 'Part C',    r: pearson(likertAvgs, corrRows.map(r => r.part_c_score as number)) },
    { label: 'Jami ball', r: pearson(likertAvgs, corrRows.map(r => r.total_score as number)) },
  ]

  function corrColor(r: number) {
    const a = Math.abs(r)
    if (a >= 0.7) return 'text-green-700 font-bold'
    if (a >= 0.4) return 'text-yellow-700 font-semibold'
    return 'text-gray-500'
  }

  function corrLabel(r: number) {
    const a = Math.abs(r)
    const dir = r > 0 ? 'положительная' : 'отрицательная'
    if (a >= 0.7) return `Сильная ${dir}`
    if (a >= 0.4) return `Умеренная ${dir}`
    if (a >= 0.2) return `Слабая ${dir}`
    return 'Практически отсутствует'
  }

  // --- 8. Universitetlar va kurslar bo'yicha solishtirma jadval ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function groupStats(arr: any[], keyFn: (r: any) => string) {
    const map: Record<string, { scored: any[]; total: number }> = {}
    arr.forEach(r => {
      const k = keyFn(r) || 'Неизвестный'
      if (!map[k]) map[k] = { scored: [], total: 0 }
      map[k].total++
      if (r.part_b_score != null && r.part_c_score != null) map[k].scored.push(r)
    })
    return Object.entries(map)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([label, { scored, total: n }]) => {
        const totals = scored.map(r => r.total_score as number).filter(Boolean)
        const ds = descStats(totals)
        const levels: Record<string, number> = { 'Высокий': 0, 'Средний': 0, 'Низкий': 0 }
        scored.forEach(r => { if (r.level && levels[r.level] !== undefined) levels[r.level]++ })
        return { label, n, scored: scored.length, ds, levels }
      })
  }

  const UNIV_SHORT: Record<string, string> = {
    'Узбекский государственный университет мировых языков (УзГУМЯ)': 'УзГУМЯ',
    'Национальный педагогический университет Узбекистана имени Низами': 'НПУ им. Низами',
    'Ферганский государственный университет': 'ФерГУ',
    'Бухарский государственный университет': 'БухГУ',
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const univGroups = groupStats(rows, (r: any) => UNIV_SHORT[r.university] ?? r.university)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const courseGroups = groupStats(rows, (r: any) => r.course)

  return (
    <div className="max-w-3xl space-y-6">
      {/* Sarlavha */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Статистика</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Всего анкетируемых: <strong>{total}</strong>
            {avgTotal != null && <> · Средний итоговый балл: <strong>{avgTotal}/100</strong></>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <WaveFilter defaultValue={wave ?? ''} basePath="/admin/stats" />
          <Link
            href={`/admin/stats/export${wave ? `?wave=${wave}` : ''}`}
            className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Excel
          </Link>
        </div>
      </div>

      {/* Tavsifiy statistika */}
      <Card title="1. Описательная статистика (таблица для диссертации)">
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4 leading-relaxed">
          N — количество анкетируемых · M — среднее · SD — стандартное отклонение · Me — медиана.
          Части Б и В — только для оценённых анкетируемых.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500">Показатель</th>
                <th className="text-center py-2 px-2 text-xs font-medium text-gray-500">N</th>
                <th className="text-center py-2 px-2 text-xs font-medium text-gray-500">Min</th>
                <th className="text-center py-2 px-2 text-xs font-medium text-gray-500">Max</th>
                <th className="text-center py-2 px-2 text-xs font-medium text-indigo-600">M</th>
                <th className="text-center py-2 px-2 text-xs font-medium text-gray-500">SD</th>
                <th className="text-center py-2 px-2 text-xs font-medium text-gray-500">Me</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {descTable.map(({ label, a }) => (
                <tr key={label}>
                  <td className="py-2.5 pr-4 text-gray-700 font-medium">{label}</td>
                  {a ? (
                    <>
                      <td className="py-2.5 px-2 text-center text-gray-600">{a.n}</td>
                      <td className="py-2.5 px-2 text-center text-gray-600">{a.min}</td>
                      <td className="py-2.5 px-2 text-center text-gray-600">{a.max}</td>
                      <td className="py-2.5 px-2 text-center font-semibold text-indigo-700">{a.mean}</td>
                      <td className="py-2.5 px-2 text-center text-gray-600">{a.sd}</td>
                      <td className="py-2.5 px-2 text-center text-gray-600">{a.median}</td>
                    </>
                  ) : (
                    <td colSpan={6} className="py-2.5 px-2 text-center text-gray-300 text-xs">Нет данных</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cronbach alpha */}
      <Card title="2. α Кронбаха — внутренняя согласованность шкалы Ликерта">
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4 leading-relaxed">
          Показывает, насколько хорошо 6 вопросов самооценки измеряют одно и то же.
          В методологии диссертации требуется α ≥ 0.70.
        </p>
        {alpha == null ? (
          <p className="text-sm text-gray-400">Для вычисления необходимо минимум 2 полных ответа по Ликерту</p>
        ) : (
          <div className="flex items-center gap-6">
            <div>
              <p className="text-4xl font-bold text-indigo-700">{alpha}</p>
              <p className="text-xs text-gray-500 mt-1">Cronbach's α (6 element, n={minLen})</p>
            </div>
            <div className={`text-sm font-medium px-3 py-1.5 rounded-lg border ${
              alpha >= 0.7 ? 'bg-green-50 border-green-200 text-green-700'
              : alpha >= 0.6 ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
              : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              {alphaLabel(alpha)}
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-4">
          Интерпретация: ≥0.90 — отлично · 0.80–0.89 — хорошо · 0.70–0.79 — приемлемо · &lt;0.70 — нужно улучшение
        </p>
      </Card>

      {/* Korrelyatsiya */}
      <Card title="3. Коэффициент Пирсона r — корреляция самооценки (Ликерт) и результатов теста">
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4 leading-relaxed">
          Сила связи между средним по шкале Ликерта и каждой частью теста.
          Сильная положительная корреляция означает, что самооценка отражает реальные знания.
          Учтены только полностью оценённые анкетируемые ({corrRows.length}).
        </p>
        {corrRows.length < 3 ? (
          <p className="text-sm text-gray-400">Для корреляции необходимо минимум 3 оценённых анкетируемых</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-medium text-gray-500">Показатель</th>
                <th className="text-center py-2 text-xs font-medium text-indigo-600">r</th>
                <th className="text-left py-2 pl-4 text-xs font-medium text-gray-500">Интерпретация</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {corrTable.map(({ label, r }) => (
                <tr key={label}>
                  <td className="py-2.5 text-gray-700">Ликерт (ср.) → {label}</td>
                  <td className={`py-2.5 text-center text-base ${r != null ? corrColor(r) : 'text-gray-300'}`}>
                    {r != null ? r : '—'}
                  </td>
                  <td className="py-2.5 pl-4 text-xs text-gray-500">
                    {r != null ? corrLabel(r) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="text-xs text-gray-400 mt-4">
          Интерпретация |r|: ≥0.70 — сильная · 0.40–0.69 — умеренная · 0.20–0.39 — слабая · &lt;0.20 — практически отсутствует
        </p>
      </Card>

      {/* Daraja taqsimoti */}
      <Card title="4. Распределение по уровням">
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4 leading-relaxed">
          По результатам теста каждому анкетируемому присваивается один из{' '}
          <strong>трёх уровней</strong>:{' '}
          <span className="text-green-700 font-medium">Высокий (80–100 баллов)</span>
          {', '}
          <span className="text-yellow-700 font-medium">Средний (50–79)</span>
          {', '}
          <span className="text-red-600 font-medium">Низкий (0–49)</span>
          {'. Уровень определяется только после оценивания частей Б и В — неоценённые анкетируемые в таблице не отображаются.'}
        </p>
        {total === 0 ? (
          <p className="text-sm text-gray-400">Нет данных</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(levelMap).map(([level, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={level} className="flex items-center gap-3">
                  <span className="w-20 text-sm text-gray-600 shrink-0">{level}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-5 rounded-full ${LEVEL_COLOR[level]} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-16 text-sm font-semibold text-gray-800 text-right">
                    {pct}% ({count})
                  </span>
                </div>
              )
            })}
            {unscored > 0 && (
              <p className="text-xs text-gray-400 pt-1">
                Ещё не оценено: {unscored} анкетируемых (не включены в проценты выше)
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Universitetlar solishtirma jadvali */}
      <Card title="5. Сравнительная таблица по университетам">
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4">
          M и SD вычисляются только для полностью оценённых анкетируемых. N — общее количество.
        </p>
        <CompareTable groups={univGroups} />
      </Card>

      {/* Kurslar solishtirma jadvali */}
      <Card title="6. Сравнительная таблица по курсам">
        <CompareTable groups={courseGroups} />
      </Card>

      {/* Blok II o'rtacha */}
      <Card title="7. Блок II — Самооценка (шкала Ликерта, 1–5)">
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4 leading-relaxed">
          В блоке II анкеты студенты самостоятельно оценивали{' '}
          <strong>уровень владения цифровыми инструментами</strong>:{' '}
          <strong>1</strong>
          {' — совсем не знаю, '}
          <strong>5</strong>
          {' — знаю очень хорошо. Ниже показан '}
          <strong>средний балл</strong>
          {' по каждому утверждению. Длина полосы пропорциональна шкале 1–5: чем длиннее — тем выше самооценка.'}
        </p>
        {total === 0 ? (
          <p className="text-sm text-gray-400">Нет данных</p>
        ) : (
          <div className="space-y-4">
            {b2Avgs.map(({ stmt, avg, count }, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 pr-4">{i + 1}. {stmt}</span>
                  <span className="shrink-0 font-semibold text-gray-800">{avg} / 5</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${(avg / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">На основе {count} ответов</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Blok III chastota */}
      <Card title="8. Блок III — Частота использования цифровых инструментов">
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-5 leading-relaxed">
          Показывает, как часто анкетируемые используют каждый инструмент.
        </p>
        {total === 0 ? (
          <p className="text-sm text-gray-400">Нет данных</p>
        ) : (
          <div className="space-y-6">
            {freqStats.map(({ tool, dist }) => (
              <div key={tool.key}>
                <p className="text-sm font-medium text-gray-700 mb-3">{tool.label}</p>
                <div className="space-y-2">
                  {dist.map(({ opt, count, pct }) => {
                    const color = opt === 'Каждый день' ? 'bg-green-500'
                      : opt === 'Несколько раз в неделю' ? 'bg-blue-400'
                      : opt === 'Редко' ? 'bg-yellow-400'
                      : 'bg-gray-300'
                    return (
                      <div key={opt} className="flex items-center gap-3">
                        <span className="w-36 text-xs text-gray-600 shrink-0">{opt}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div className={`h-4 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-16 text-xs font-semibold text-gray-700 text-right">
                          {pct}% ({count})
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Blok IV qiyinchiliklar */}
      <Card title="9. Блок IV — Трудности при использовании цифровых инструментов">
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4 leading-relaxed">
          Студенты могли отмечать{' '}
          <strong>несколько затруднений</strong>
          {' одновременно. Приведённые проценты показывают, '}
          <strong>какой процент анкетируемых указал каждое затруднение</strong>
          {'. Высокий процент означает, что проблема распространена среди большинства.'}
        </p>
        {total === 0 ? (
          <p className="text-sm text-gray-400">Нет данных</p>
        ) : (
          <div className="space-y-3">
            {diffStats
              .sort((a, b) => b.pct - a.pct)
              .map(({ opt, count, pct }) => (
                <div key={opt} className="flex items-center gap-3">
                  <span className="flex-1 text-sm text-gray-700">{opt}</span>
                  <div className="w-32 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-4 rounded-full bg-orange-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-16 text-sm font-semibold text-gray-800 text-right">
                    {pct}% ({count})
                  </span>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">
        {title}
      </h2>
      {children}
    </div>
  )
}

type GroupRow = {
  label: string
  n: number
  scored: number
  ds: { n: number; min: number; max: number; mean: number; sd: number; median: number } | null
  levels: Record<string, number>
}

function CompareTable({ groups }: { groups: GroupRow[] }) {
  if (groups.length === 0) return <p className="text-sm text-gray-400">Нет данных</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500">Группа</th>
            <th className="text-center py-2 px-2 text-xs font-medium text-gray-500">N</th>
            <th className="text-center py-2 px-2 text-xs font-medium text-gray-500">Оц.</th>
            <th className="text-center py-2 px-2 text-xs font-medium text-indigo-600">M</th>
            <th className="text-center py-2 px-2 text-xs font-medium text-gray-500">SD</th>
            <th className="text-center py-2 px-2 text-xs font-medium text-green-600">Выс.</th>
            <th className="text-center py-2 px-2 text-xs font-medium text-yellow-600">Ср.</th>
            <th className="text-center py-2 px-2 text-xs font-medium text-red-500">Низ.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {groups.map(({ label, n, scored, ds, levels }) => (
            <tr key={label}>
              <td className="py-2.5 pr-3 text-gray-800 font-medium text-xs">{label}</td>
              <td className="py-2.5 px-2 text-center text-gray-600">{n}</td>
              <td className="py-2.5 px-2 text-center text-gray-500 text-xs">{scored}</td>
              <td className="py-2.5 px-2 text-center font-semibold text-indigo-700">{ds?.mean ?? '—'}</td>
              <td className="py-2.5 px-2 text-center text-gray-500">{ds?.sd ?? '—'}</td>
              <td className="py-2.5 px-2 text-center text-green-700">{levels['Высокий'] || 0}</td>
              <td className="py-2.5 px-2 text-center text-yellow-700">{levels['Средний'] || 0}</td>
              <td className="py-2.5 px-2 text-center text-red-500">{levels['Низкий'] || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-2">
        N — всего · Оц. — оценено · M — средний итоговый балл · SD — стандартное отклонение · Выс./Ср./Низ. — количество по уровням
      </p>
    </div>
  )
}
