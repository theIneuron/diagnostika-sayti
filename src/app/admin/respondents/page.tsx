import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Респонденты | ДиагКомп-Рус' }
export const dynamic = 'force-dynamic'

function buildQuery(params: Record<string, string | undefined>) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) q.set(k, v)
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const LEVEL_COLOR: Record<string, string> = {
  'Высокий': 'bg-green-100 text-green-700',
  'Средний': 'bg-yellow-100 text-yellow-700',
  'Низкий':  'bg-red-100 text-red-700',
}

const VALID_SORTS: Record<string, string> = {
  total_score:   'total_score',
  part_a_score:  'part_a_score',
  part_b_score:  'part_b_score',
  part_c_score:  'part_c_score',
  university:    'university',
  course:        'course',
  created_at:    'created_at',
}

export default async function RespondentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    wave?: string; university?: string; course?: string
    unscored?: string; sort?: string; dir?: string; page?: string
  }>
}) {
  const { wave, university, course, unscored, sort: sortParam, dir: dirParam, page: pageParam } = await searchParams
  const onlyUnscored = unscored === '1'
  const sort = (sortParam && VALID_SORTS[sortParam]) ? sortParam : 'created_at'
  const dir  = dirParam === 'asc' ? 'asc' : 'desc'
  const PAGE_SIZE = 25
  const page = Math.max(1, parseInt(pageParam ?? '1'))
  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function withFilters(q: any): any {
    if (wave)         q = q.eq('wave', Number(wave))
    if (university)   q = q.ilike('university', `%${university}%`)
    if (course)       q = q.eq('course', course)
    if (onlyUnscored) q = q.or('part_b_score.is.null,part_c_score.is.null')
    return q
  }

  const [{ count: totalCount }, { data }] = await Promise.all([
    withFilters(supabase.from('respondents').select('*', { count: 'exact', head: true })),
    withFilters(
      supabase
        .from('respondents')
        .select('id, created_at, wave, university, course, part_a_score, part_b_score, part_c_score, total_score, level')
        .order(VALID_SORTS[sort], { ascending: dir === 'asc' })
    ).range(from, to),
  ])

  const total = totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

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
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scoredCount   = rows.filter((r: any) => r.part_b_score !== null && r.part_c_score !== null).length
  const unscoredCount = rows.length - scoredCount

  const filters = { wave, university, course, unscored }

  function sortLink(col: string, label: string) {
    const isActive = sort === col
    const newDir   = isActive && dir === 'desc' ? 'asc' : 'desc'
    const indicator = isActive ? (dir === 'desc' ? ' ↓' : ' ↑') : ''
    return (
      <Link
        href={`/admin/respondents${buildQuery({ ...filters, sort: col, dir: newDir })}`}
        className={`hover:text-gray-800 transition-colors ${isActive ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}
      >
        {label}{indicator}
      </Link>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Респонденты</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Всего: {total} · Оценено: {scoredCount} · Не оценено: {unscoredCount}
            {totalPages > 1 && <> · Страница {page}/{totalPages}</>}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/respondents/export/scoring${wave ? `?wave=${wave}` : ''}`}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            title="Оценочный лист для части B и C (2 колонки эксперта)"
          >
            Оценочный лист
          </Link>
          <Link
            href={`/admin/respondents/export/excel${buildQuery({ wave, course, university, unscored })}`}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Excel
          </Link>
          <Link
            href={`/admin/respondents/export${buildQuery({ wave, course, university, unscored })}`}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            CSV
          </Link>
        </div>
      </div>

      {/* To'lqin havolalari */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
        <p className="text-xs font-medium text-blue-700 mb-2">Ссылка для участников (по волнам)</p>
        <div className="flex flex-col gap-1.5">
          {[1, 2].map(w => {
            const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/anketa${w === 2 ? '?wave=2' : ''}`
            return (
              <div key={w} className="flex items-center gap-2">
                <span className="text-xs text-blue-600 font-medium w-20">Волна {w}:</span>
                <code className="text-xs bg-white border border-blue-200 rounded px-2 py-0.5 text-blue-800 select-all flex-1 truncate">
                  {url}
                </code>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filtrlar */}
      <form className="flex flex-wrap gap-3 mb-5">
        <select name="wave" defaultValue={wave ?? ''} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">Все волны</option>
          <option value="1">Волна 1</option>
          <option value="2">Волна 2</option>
        </select>
        <select name="course" defaultValue={course ?? ''} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">Все курсы</option>
          <option value="Бакалавр 3 курс">Бакалавр 3 курс</option>
          <option value="Бакалавр 4 курс">Бакалавр 4 курс</option>
          <option value="Магистратура 1 курс">Магистратура 1 курс</option>
          <option value="Магистратура 2 курс">Магистратура 2 курс</option>
        </select>
        <input
          name="university"
          defaultValue={university ?? ''}
          placeholder="Поиск по вузу..."
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-56"
        />
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name="unscored"
            value="1"
            defaultChecked={onlyUnscored}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-600">Только не оценённые</span>
        </label>
        <button type="submit" className="px-4 py-1.5 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-800">
          Применить
        </button>
        {(wave || university || course || onlyUnscored) && (
          <Link href="/admin/respondents" className="px-4 py-1.5 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">
            Сбросить
          </Link>
        )}
      </form>

      {/* Jadval */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs uppercase">#</th>
              <th className="text-left px-4 py-3 text-xs uppercase">{sortLink('university', 'Вуз')}</th>
              <th className="text-left px-4 py-3 text-xs uppercase">{sortLink('course', 'Курс')}</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Волна</th>
              <th className="text-center px-3 py-3 text-xs uppercase">{sortLink('part_a_score', 'A')}</th>
              <th className="text-center px-3 py-3 text-xs uppercase">{sortLink('part_b_score', 'B')}</th>
              <th className="text-center px-3 py-3 text-xs uppercase">{sortLink('part_c_score', 'В')}</th>
              <th className="text-center px-3 py-3 text-xs uppercase">{sortLink('total_score', 'Итого')}</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Уровень</th>
              <th className="text-left px-4 py-3 text-xs uppercase">{sortLink('created_at', 'Дата')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-10 text-gray-400">
                  Нет респондентов
                </td>
              </tr>
            )}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {rows.map((r: any, i: number) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400">{from + i + 1}</td>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">
            {from + 1}–{Math.min(to + 1, total)} / {total}
          </p>
          <div className="flex items-center gap-1">
            {page > 1 && (
              <Link
                href={`/admin/respondents${buildQuery({ ...filters, sort, dir, page: String(page - 1) })}`}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                ← Предыдущая
              </Link>
            )}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p: number
              if (totalPages <= 7) {
                p = i + 1
              } else if (page <= 4) {
                p = i + 1
              } else if (page >= totalPages - 3) {
                p = totalPages - 6 + i
              } else {
                p = page - 3 + i
              }
              return (
                <Link
                  key={p}
                  href={`/admin/respondents${buildQuery({ ...filters, sort, dir, page: String(p) })}`}
                  className={`px-3 py-1.5 text-sm border rounded-lg ${p === page ? 'bg-indigo-600 border-indigo-600 text-white font-medium' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  {p}
                </Link>
              )
            })}
            {page < totalPages && (
              <Link
                href={`/admin/respondents${buildQuery({ ...filters, sort, dir, page: String(page + 1) })}`}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Следующая →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
