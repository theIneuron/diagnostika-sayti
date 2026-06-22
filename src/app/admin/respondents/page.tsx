import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Respondentlar | Admin' }
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const LEVEL_COLOR: Record<string, string> = {
  'Высокий': 'bg-green-100 text-green-700',
  'Средний': 'bg-yellow-100 text-yellow-700',
  'Низкий':  'bg-red-100 text-red-700',
}

export default async function RespondentsPage({
  searchParams,
}: {
  searchParams: Promise<{ wave?: string; university?: string }>
}) {
  const { wave, university } = await searchParams

  let query = supabase
    .from('respondents')
    .select('id, created_at, wave, university, course, part_a_score, part_b_score, part_c_score, total_score, level')
    .order('created_at', { ascending: false })

  if (wave) query = query.eq('wave', Number(wave))
  if (university) query = query.ilike('university', `%${university}%`)

  const { data } = await query
  const rows = data ?? []

  const scored   = rows.filter(r => r.part_b_score !== null && r.part_c_score !== null).length
  const unscored = rows.length - scored

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Respondentlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Jami: {rows.length} · Baholangan: {scored} · Baholanmagan: {unscored}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/respondents/export/excel"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Excel
          </Link>
          <Link
            href="/admin/respondents/export"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            CSV
          </Link>
        </div>
      </div>

      {/* To'lqin havolalari */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
        <p className="text-xs font-medium text-blue-700 mb-2">Ishtirokchilar uchun havola (to'lqin bo'yicha)</p>
        <div className="flex flex-col gap-1.5">
          {[1, 2].map(w => {
            const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/anketa${w === 2 ? '?wave=2' : ''}`
            return (
              <div key={w} className="flex items-center gap-2">
                <span className="text-xs text-blue-600 font-medium w-20">To'lqin {w}:</span>
                <code className="text-xs bg-white border border-blue-200 rounded px-2 py-0.5 text-blue-800 select-all flex-1 truncate">
                  {url}
                </code>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filtrlar */}
      <form className="flex gap-3 mb-5">
        <select
          name="wave"
          defaultValue={wave ?? ''}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">Barcha to'lqinlar</option>
          <option value="1">To'lqin 1</option>
          <option value="2">To'lqin 2</option>
        </select>
        <input
          name="university"
          defaultValue={university ?? ''}
          placeholder="Vuz bo'yicha qidirish..."
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-64"
        />
        <button
          type="submit"
          className="px-4 py-1.5 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-800"
        >
          Filter
        </button>
        {(wave || university) && (
          <Link href="/admin/respondents" className="px-4 py-1.5 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">
            Tozalash
          </Link>
        )}
      </form>

      {/* Jadval */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Vuz</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Kurs</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">T'lqin</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">A</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">B</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">V</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Jami</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Daraja</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sana</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-10 text-gray-400">
                  Respondentlar yo'q
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 text-gray-700 max-w-[180px] truncate">
                  <Link href={`/admin/respondents/${r.id}`} className="hover:text-indigo-600 hover:underline">
                    {r.university ?? '—'}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.course ?? '—'}</td>
                <td className="px-3 py-3 text-center text-gray-500">{r.wave ?? 1}</td>
                <td className="px-3 py-3 text-center text-gray-700">
                  {r.part_a_score != null ? r.part_a_score : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-3 py-3 text-center">
                  {r.part_b_score != null
                    ? <span className="text-gray-700">{r.part_b_score}</span>
                    : <span className="text-orange-400 font-medium">·</span>}
                </td>
                <td className="px-3 py-3 text-center">
                  {r.part_c_score != null
                    ? <span className="text-gray-700">{r.part_c_score}</span>
                    : <span className="text-orange-400 font-medium">·</span>}
                </td>
                <td className="px-3 py-3 text-center font-semibold text-gray-800">
                  {r.total_score != null ? r.total_score : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-3 py-3 text-center">
                  {r.level
                    ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLOR[r.level] ?? 'bg-gray-100 text-gray-600'}`}>{r.level}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {new Date(r.created_at).toLocaleDateString('ru-RU')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
