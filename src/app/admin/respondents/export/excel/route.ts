import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import * as XLSX from 'xlsx'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const HEADERS = [
  'ID', 'Дата', 'Волна', 'Вуз', 'Курс', 'Направление', 'Контакт', 'Согласие',
  'Б2_LMS_матер', 'Б2_LMS_тест', 'Б2_Интерактив', 'Б2_ИИ', 'Б2_Оценивание', 'Б2_Урок',
  'Б3_Частота_LMS', 'Б3_Частота_интер', 'Б3_Частота_ИИ',
  'Затруднения', 'Открытый_ответ',
  'Часть_А_балл', 'Кейс_Б', 'Ответ_Б', 'Балл_Б',
  'Файл_В', 'Обоснование_В', 'Балл_В',
  'Итого', 'Уровень',
]

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams
  const wave       = p.get('wave')
  const course     = p.get('course')
  const university = p.get('university')
  const unscored   = p.get('unscored') === '1'

  let query = supabase.from('respondents').select('*').order('created_at', { ascending: true })
  if (wave)       query = query.eq('wave', Number(wave))
  if (course)     query = query.eq('course', course)
  if (university) query = query.ilike('university', `%${university}%`)
  if (unscored)   query = query.or('part_b_score.is.null,part_c_score.is.null')

  const { data, error } = await query
  if (error) return new Response('Ошибка при загрузке данных', { status: 500 })

  const rows = data ?? []

  const sheetData = [
    HEADERS,
    ...rows.map(r => [
      r.id,
      new Date(r.created_at).toLocaleString('ru-RU'),
      r.wave,
      r.university,
      r.course,
      r.direction,
      r.contact ?? '',
      r.consent ? 'Да' : 'Нет',
      r.b2_q1, r.b2_q2, r.b2_q3, r.b2_q4, r.b2_q5, r.b2_q6,
      r.b3_lms, r.b3_interactive, r.b3_ai,
      Array.isArray(r.difficulties) ? r.difficulties.join(' | ') : '',
      r.open_answer ?? '',
      r.part_a_score ?? '',
      r.part_b_case ?? '',
      r.part_b_answer ?? '',
      r.part_b_score ?? '',
      r.part_c_file_url ?? '',
      r.part_c_justification ?? '',
      r.part_c_score ?? '',
      r.total_score ?? '',
      r.level ?? '',
    ])
  ]

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(sheetData)

  // Ustun kengliklarini avtomatik sozlash
  ws['!cols'] = HEADERS.map((h, i) => ({
    wch: Math.max(h.length, ...sheetData.slice(1).map(row => String(row[i] ?? '').length), 10)
  }))

  XLSX.utils.book_append_sheet(wb, ws, 'Respondentlar')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  const date = new Date().toISOString().slice(0, 10)
  const suffix = [wave && `wave${wave}`, course && course.replace(/\s/g, '_'), unscored && 'unscored']
    .filter(Boolean).join('_')
  const filename = `diagnostika_${date}${suffix ? `_${suffix}` : ''}.xlsx`

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
