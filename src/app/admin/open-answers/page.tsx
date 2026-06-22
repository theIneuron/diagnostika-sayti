import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'
import WaveFilter from '@/components/admin/WaveFilter'

export const metadata: Metadata = { title: "Ochiq javoblar | Admin" }
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function OpenAnswersPage({
  searchParams,
}: {
  searchParams: Promise<{ wave?: string; university?: string; course?: string; empty?: string }>
}) {
  const { wave, university, course, empty } = await searchParams
  const showEmpty = empty === '1'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = supabase.from('respondents').select<string, any>(
    'id, university, course, wave, open_answer, total_score, level, created_at'
  ).order('created_at', { ascending: false })

  if (wave)       query = query.eq('wave', Number(wave))
  if (university) query = query.ilike('university', `%${university}%`)
  if (course)     query = query.eq('course', course)
  if (!showEmpty) query = query.not('open_answer', 'is', null).neq('open_answer', '')

  const { data } = await query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[]

  const withAnswer = rows.filter(r => r.open_answer)
  const wordCounts = withAnswer.map(r => (r.open_answer as string).trim().split(/\s+/).length)
  const avgWords = wordCounts.length
    ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)
    : 0

  const LEVEL_COLOR: Record<string, string> = {
    'Высокий': 'bg-green-100 text-green-700',
    'Средний': 'bg-yellow-100 text-yellow-700',
    'Низкий':  'bg-red-100 text-red-700',
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ochiq javoblar</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {withAnswer.length} ta javob
            {avgWords > 0 && <> · O&apos;rtacha {avgWords} so&apos;z</>}
          </p>
        </div>
        <WaveFilter defaultValue={wave ?? ''} basePath="/admin/open-answers" />
      </div>

      {/* Filtrlar */}
      <form className="flex flex-wrap gap-3 mb-5">
        <select name="wave" defaultValue={wave ?? ''} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">Barcha to'lqinlar</option>
          <option value="1">To'lqin 1</option>
          <option value="2">To'lqin 2</option>
        </select>
        <select name="course" defaultValue={course ?? ''} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">Barcha kurslar</option>
          <option value="3 курс">3 kurs</option>
          <option value="4 курс">4 kurs</option>
          <option value="магистратура">Magistratura</option>
        </select>
        <input
          name="university"
          defaultValue={university ?? ''}
          placeholder="Vuz bo'yicha..."
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-48"
        />
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name="empty"
            value="1"
            defaultChecked={showEmpty}
            className="rounded border-gray-300 text-indigo-600"
          />
          <span className="text-sm text-gray-600">Bo'sh javoblarni ham ko'rsat</span>
        </label>
        <button type="submit" className="px-4 py-1.5 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-800">
          Filter
        </button>
        {(wave || university || course) && (
          <Link href="/admin/open-answers" className="px-4 py-1.5 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">
            Tozalash
          </Link>
        )}
      </form>

      {/* Javoblar ro'yxati */}
      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
          Javob topilmadi
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => {
            const hasAnswer = r.open_answer && r.open_answer.trim()
            const words = hasAnswer ? r.open_answer.trim().split(/\s+/).length : 0
            return (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
                {/* Meta */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400 font-mono">{i + 1}.</span>
                    <Link
                      href={`/admin/respondents/${r.id}`}
                      className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                      {r.university ?? "Noma'lum vuz"}
                    </Link>
                    {r.course && (
                      <span className="text-xs text-gray-500">{r.course}</span>
                    )}
                    <span className="text-xs text-gray-400">To'lqin {r.wave ?? 1}</span>
                    {r.level && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${LEVEL_COLOR[r.level] ?? 'bg-gray-100 text-gray-500'}`}>
                        {r.level}
                      </span>
                    )}
                    {r.total_score != null && (
                      <span className="text-xs text-gray-500">{r.total_score}/100</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(r.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>

                {/* Javob matni */}
                {hasAnswer ? (
                  <>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {r.open_answer}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">{words} so'z</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-300 italic">Javob yozilmagan</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
