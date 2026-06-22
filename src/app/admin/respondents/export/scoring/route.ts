import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import * as XLSX from 'xlsx'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams
  const wave = p.get('wave')

  let query = supabase
    .from('respondents')
    .select('id, created_at, wave, university, course, part_a_score, part_b_case, part_b_answer, part_b_score, part_c_file_url, part_c_justification, part_c_score, total_score, level')
    .order('university', { ascending: true })
    .order('created_at', { ascending: true })
  if (wave) query = query.eq('wave', Number(wave))

  const { data, error } = await query
  if (error) return new Response('Xato', { status: 500 })

  const rows = data ?? []

  // Sheet 1: Part B baholash varaqasi
  const bHeaders = [
    '#', 'ID (qisqa)', 'Vuz', 'Kurs', "To'lqin", 'Part A (avto)',
    'Keys raqami', 'Part B javobi (to\'liq matn)',
    'Mavjud B bali', 'Ekspert 1 bali', 'Ekspert 2 bali', 'Izoh',
  ]
  const bRows = rows.map((r, i) => [
    i + 1,
    String(r.id).slice(0, 8),
    r.university ?? '',
    r.course ?? '',
    r.wave ?? 1,
    r.part_a_score ?? '',
    r.part_b_case ?? 1,
    r.part_b_answer ?? '',
    r.part_b_score ?? '',
    '',
    '',
    '',
  ])

  // Sheet 2: Part C baholash varaqasi
  const cHeaders = [
    '#', 'ID (qisqa)', 'Vuz', 'Kurs', "To'lqin", 'Part A (avto)',
    'Fayl / havola', "Asoslash matni",
    'Mavjud C bali', 'Ekspert 1 bali', 'Ekspert 2 bali', 'Izoh',
  ]
  const cRows = rows.map((r, i) => [
    i + 1,
    String(r.id).slice(0, 8),
    r.university ?? '',
    r.course ?? '',
    r.wave ?? 1,
    r.part_a_score ?? '',
    r.part_c_file_url ?? '',
    r.part_c_justification ?? '',
    r.part_c_score ?? '',
    '',
    '',
    '',
  ])

  // Sheet 3: Yakuniy ballar jadvali
  const summaryHeaders = [
    '#', 'ID (qisqa)', 'Vuz', 'Kurs', "To'lqin",
    'Part A (max 20)', 'Part B (max 30)', 'Part C (max 50)', 'Jami (max 100)', 'Daraja',
  ]
  const summaryRows = rows.map((r, i) => [
    i + 1,
    String(r.id).slice(0, 8),
    r.university ?? '',
    r.course ?? '',
    r.wave ?? 1,
    r.part_a_score ?? '',
    r.part_b_score ?? '',
    r.part_c_score ?? '',
    r.total_score ?? '',
    r.level ?? '',
  ])

  const wb = XLSX.utils.book_new()

  function makeSheet(headers: string[], dataRows: (string | number)[][]) {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
    // Ustun kengliklari
    ws['!cols'] = headers.map((h, i) => ({
      wch: Math.max(h.length, ...dataRows.map(row => String(row[i] ?? '').length), 10)
    }))
    // Part B/C javob ustunini keng qil
    if (ws['!cols'][7]) ws['!cols'][7] = { wch: 60 }
    return ws
  }

  XLSX.utils.book_append_sheet(wb, makeSheet(bHeaders, bRows), 'Part B baholash')
  XLSX.utils.book_append_sheet(wb, makeSheet(cHeaders, cRows), 'Part C baholash')
  XLSX.utils.book_append_sheet(wb, makeSheet(summaryHeaders, summaryRows), 'Yakuniy ballar')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const date = new Date().toISOString().slice(0, 10)
  const filename = `baholash_varaqasi_${date}${wave ? `_wave${wave}` : ''}.xlsx`

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
