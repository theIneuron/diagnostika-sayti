import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function escape(value: unknown): string {
  if (value == null) return ''
  const str = Array.isArray(value) ? value.join(' | ') : String(value)
  // CSV da vergul yoki qo'shtirnoq bo'lsa, qo'shtirnoq ichiga olish
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

const HEADERS = [
  'ID', 'Дата', 'Волна', 'Вуз', 'Курс', 'Направление', 'Контакт', 'Согласие',
  'Б2_ЛМС_матер', 'Б2_ЛМС_тест', 'Б2_Интерактив', 'Б2_ИИ', 'Б2_Оценивание', 'Б2_Урок',
  'Б3_Частота_LMS', 'Б3_Частота_интер', 'Б3_Частота_ИИ',
  'Затруднения', 'Открытый_ответ',
  'Часть_А_балл', 'Кейс_Б', 'Ответ_Б', 'Балл_Б',
  'Файл_В', 'Обоснование_В', 'Балл_В',
  'Итого', 'Уровень',
]

export async function GET(request: NextRequest) {
  const wave = request.nextUrl.searchParams.get('wave')

  let query = supabase.from('respondents').select('*').order('created_at', { ascending: true })
  if (wave) query = query.eq('wave', Number(wave))

  const { data, error } = await query
  if (error) return new Response('Ошибка при загрузке данных', { status: 500 })

  const rows = data ?? []

  const csvRows = [
    HEADERS.join(','),
    ...rows.map(r => [
      escape(r.id),
      escape(new Date(r.created_at).toLocaleString('ru-RU')),
      escape(r.wave),
      escape(r.university),
      escape(r.course),
      escape(r.direction),
      escape(r.contact),
      escape(r.consent ? 'Да' : 'Нет'),
      escape(r.b2_q1), escape(r.b2_q2), escape(r.b2_q3),
      escape(r.b2_q4), escape(r.b2_q5), escape(r.b2_q6),
      escape(r.b3_lms), escape(r.b3_interactive), escape(r.b3_ai),
      escape(r.difficulties),
      escape(r.open_answer),
      escape(r.part_a_score),
      escape(r.part_b_case),
      escape(r.part_b_answer),
      escape(r.part_b_score),
      escape(r.part_c_file_url),
      escape(r.part_c_justification),
      escape(r.part_c_score),
      escape(r.total_score),
      escape(r.level),
    ].join(','))
  ]

  // UTF-8 BOM — Excel Kirill harflarini to'g'ri o'qishi uchun
  const bom = '﻿'
  const csv = bom + csvRows.join('\r\n')

  const date = new Date().toISOString().slice(0, 10)
  const filename = `diagnostika_${date}${wave ? `_wave${wave}` : ''}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
