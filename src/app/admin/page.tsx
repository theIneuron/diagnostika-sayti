import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard | Admin' }
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const LEVEL_COLOR: Record<string, string> = {
  'Высокий': 'text-green-600 bg-green-50 border-green-200',
  'Средний': 'text-yellow-600 bg-yellow-50 border-yellow-200',
  'Низкий':  'text-red-500 bg-red-50 border-red-200',
}

export default async function AdminDashboard() {
  const { data } = await supabase
    .from('respondents')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select<string, any>(
      'id, created_at, wave, university, course, level, total_score, part_a_score, part_b_score, part_c_score'
    )
    .order('created_at', { ascending: false })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []).map((r: any) => {
    if (r.part_b_score != null && r.part_c_score != null) {
      const t = Math.round(((r.part_a_score ?? 0) + r.part_b_score + r.part_c_score) * 100) / 100
      return { ...r, total_score: r.total_score ?? t, level: r.level ?? (t >= 80 ? 'Высокий' : t >= 50 ? 'Средний' : 'Низкий') }
    }
    return r
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any[]

  const total = rows.length
  const scored = rows.filter(r => r.part_b_score != null && r.part_c_score != null)
  const unscored = total - scored.length

  const avgScore = scored.length
    ? Math.round(scored.reduce((a: number, r) => a + (r.total_score ?? 0), 0) / scored.length * 10) / 10
    : null

  const levelCounts: Record<string, number> = { 'Высокий': 0, 'Средний': 0, 'Низкий': 0 }
  scored.forEach(r => { if (r.level && levelCounts[r.level] !== undefined) levelCounts[r.level]++ })

  const wave1 = rows.filter(r => r.wave === 1 || r.wave == null).length
  const wave2 = rows.filter(r => r.wave === 2).length

  // University breakdown
  const univMap: Record<string, { total: number; scored: number }> = {}
  rows.forEach(r => {
    const key = r.university ?? "Noma'lum"
    if (!univMap[key]) univMap[key] = { total: 0, scored: 0 }
    univMap[key].total++
    if (r.part_b_score != null && r.part_c_score != null) univMap[key].scored++
  })
  const univList = Object.entries(univMap).sort((a, b) => b[1].total - a[1].total)

  // Recent 6 submissions
  const recent = rows.slice(0, 6)

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tadqiqot holati — real vaqtda</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Jami respondent" value={String(total)} sub={`To'lqin 1: ${wave1} · 2: ${wave2}`} color="indigo" />
        <KpiCard label="Baholangan" value={String(scored.length)} sub={`${total > 0 ? Math.round(scored.length / total * 100) : 0}% yakunlangan`} color="green" />
        <KpiCard label="Baholanmagan" value={String(unscored)} sub={unscored > 0 ? "Ko'rib chiqing" : 'Hammasi tayyor'} color={unscored > 0 ? 'orange' : 'gray'} />
        <KpiCard label="O'rtacha ball" value={avgScore != null ? `${avgScore}` : '—'} sub="/ 100 (baholanganlarda)" color="purple" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Darajalar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Darajalar taqsimoti</h2>
          {scored.length === 0 ? (
            <p className="text-sm text-gray-400">Baholangan respondent yo'q</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(levelCounts).map(([lv, cnt]) => {
                const pct = scored.length > 0 ? Math.round(cnt / scored.length * 100) : 0
                const bar = lv === 'Высокий' ? 'bg-green-500' : lv === 'Средний' ? 'bg-yellow-400' : 'bg-red-400'
                return (
                  <div key={lv} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-gray-600 shrink-0">{lv}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div className={`h-4 rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-14 text-sm font-semibold text-gray-700 text-right">{pct}% ({cnt})</span>
                  </div>
                )
              })}
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-gray-100 flex gap-3">
            <Link href="/admin/charts" className="text-xs text-indigo-600 hover:underline">Diagrammalar →</Link>
            <Link href="/admin/compare" className="text-xs text-indigo-600 hover:underline">To'lqin tahlili →</Link>
          </div>
        </div>

        {/* Universitetlar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Universitetlar bo'yicha</h2>
          {univList.length === 0 ? (
            <p className="text-sm text-gray-400">Ma'lumot yo'q</p>
          ) : (
            <div className="space-y-2">
              {univList.map(([univ, { total: t, scored: s }]) => (
                <div key={univ} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 text-gray-700 truncate" title={univ}>{univ}</span>
                  <span className="text-xs text-gray-400 shrink-0">{s}/{t} baholangan</span>
                  <span className="font-semibold text-gray-800 w-6 text-right">{t}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Link href="/admin/respondents" className="text-xs text-indigo-600 hover:underline">Ro'yxat →</Link>
          </div>
        </div>
      </div>

      {/* So'nggi respondentlar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">So'nggi qo'shilganlar</h2>
          {unscored > 0 && (
            <Link
              href="/admin/respondents?unscored=1"
              className="text-xs bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1 rounded-lg hover:bg-orange-100 font-medium"
            >
              {unscored} ta baholanmagan →
            </Link>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-400">Respondent yo'q</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map(r => (
              <div key={r.id} className="flex items-center gap-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <Link href={`/admin/respondents/${r.id}`} className="text-sm text-gray-800 hover:text-indigo-600 hover:underline truncate block">
                    {r.university ?? "Noma'lum vuz"}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {r.course ?? '—'} · To'lqin {r.wave ?? 1}
                  </p>
                </div>
                {r.level ? (
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${LEVEL_COLOR[r.level] ?? ''}`}>
                    {r.total_score}/100
                  </span>
                ) : (
                  <span className="text-xs text-orange-400 font-medium shrink-0">Baholanmagan</span>
                )}
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(r.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Link href="/admin/respondents" className="text-xs text-indigo-600 hover:underline">
            Barcha {total} ta respondentni ko'rish →
          </Link>
        </div>
      </div>

      {/* Tezkor havolalar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: '/admin/respondents/export/excel', label: 'Excel eksport', color: 'green' },
          { href: '/admin/respondents/export/scoring', label: 'Baholash varaqasi', color: 'green' },
          { href: '/admin/stats', label: 'Statistika', color: 'indigo' },
          { href: '/admin/open-answers', label: 'Ochiq javoblar', color: 'purple' },
          { href: '/admin/respondents?unscored=1', label: 'Baholanmaganlar', color: 'orange' },
        ].map(({ href, label, color }) => (
          <Link
            key={href}
            href={href}
            className={`block text-center px-4 py-3 rounded-xl border text-sm font-medium transition-colors
              ${color === 'green'  ? 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100' :
                color === 'indigo' ? 'border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100' :
                color === 'purple' ? 'border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100' :
                                     'border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100'}`}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const colors: Record<string, string> = {
    indigo: 'border-indigo-200 bg-indigo-50',
    green:  'border-green-200 bg-green-50',
    orange: 'border-orange-200 bg-orange-50',
    gray:   'border-gray-200 bg-gray-50',
    purple: 'border-purple-200 bg-purple-50',
  }
  const valColors: Record<string, string> = {
    indigo: 'text-indigo-700', green: 'text-green-700',
    orange: 'text-orange-600', gray: 'text-gray-600', purple: 'text-purple-700',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color] ?? colors.gray}`}>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${valColors[color] ?? ''}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}
