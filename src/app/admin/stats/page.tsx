import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { LIKERT_STATEMENTS, DIFFICULTY_OPTIONS } from '@/types/anketa'
import WaveFilter from '@/components/admin/WaveFilter'

export const metadata: Metadata = { title: 'Statistika | Admin' }
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
    'wave, level, total_score, part_a_score, ' +
    'b2_q1, b2_q2, b2_q3, b2_q4, b2_q5, b2_q6, ' +
    'difficulties'
  )
  if (wave) query = query.eq('wave', Number(wave))

  const { data } = await query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[]
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

  // --- 4. O'rtacha umumiy ball ---
  const scoredRows = rows.filter(r => r.total_score != null)
  const avgTotal = scoredRows.length > 0
    ? Math.round(scoredRows.reduce((a, r) => a + (r.total_score as number), 0) / scoredRows.length * 10) / 10
    : null

  return (
    <div className="max-w-3xl space-y-6">
      {/* Sarlavha */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Statistika</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Jami respondentlar: <strong>{total}</strong>
            {avgTotal != null && <> · O&apos;rtacha umumiy ball: <strong>{avgTotal}/100</strong></>}
          </p>
        </div>
        <WaveFilter defaultValue={wave ?? ''} basePath="/admin/stats" />
      </div>

      {/* Daraja taqsimoti */}
      <Card title="1. Darajalar bo'yicha taqsimot">
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4 leading-relaxed">
          {'Har bir respondentning test natijalari asosida '}
          <strong>uch daraja</strong>
          {' belgilanadi: '}
          <span className="text-green-700 font-medium">Юқори (80–100 балл)</span>
          {', '}
          <span className="text-yellow-700 font-medium">Ўрта (50–79)</span>
          {', '}
          <span className="text-red-600 font-medium">Паст (0–49)</span>
          {'. Daraja faqat Part B va Part C baholangandan keyin hisoblanadi — shuning uchun baholanmagan respondentlar bu jadvalda ko\'rinmaydi.'}
        </p>
        {total === 0 ? (
          <p className="text-sm text-gray-400">Ma'lumot yo'q</p>
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
                Hali baholanmagan: {unscored} ta respondent (yuqoridagi foizlarga kirmaydi)
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Blok II o'rtacha */}
      <Card title="2. Блок II — O'z-o'zini baholash (Likert, 1–5)">
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4 leading-relaxed">
          {"Anketaning II blokida talabalar "}
          <strong>raqamli vositalarni qanchalik egallashini</strong>
          {" o'zlari baholagan: "}
          <strong>1</strong>
          {" — umuman bilmayman, "}
          <strong>5</strong>
          {" — juda yaxshi bilaman. Quyida har bir ifoda bo'yicha barcha respondentlarning "}
          <strong>o'rtacha bali</strong>
          {" ko'rsatilgan. Chiziq uzunligi 5 ballik shkalaga nisbatan — uzunroq = yuqoriroq o'z-o'zini baholash."}
        </p>
        {total === 0 ? (
          <p className="text-sm text-gray-400">Ma'lumot yo'q</p>
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
                <p className="text-xs text-gray-400 mt-0.5">{count} ta javob asosida</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Blok IV qiyinchiliklar */}
      <Card title="3. Блок IV — Raqamli vositalardan foydalanishdagi qiyinchiliklar">
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4 leading-relaxed">
          {"Talabalar bir vaqtda "}
          <strong>bir nechta qiyinchilikni</strong>
          {" belgilashi mumkin edi. Quyidagi foizlar har bir qiyinlikni "}
          <strong>necha foiz respondent belgilaganini</strong>
          {" ko'rsatadi. Foiz yuqori bo'lsa, bu muammo ko'pchilik uchun keng tarqalgan degani."}
        </p>
        {total === 0 ? (
          <p className="text-sm text-gray-400">Ma'lumot yo'q</p>
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
