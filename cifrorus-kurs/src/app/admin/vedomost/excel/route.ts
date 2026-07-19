import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { isAdmin } from '@/lib/adminAuth'
import { supabase } from '@/lib/supabase'
import { MODULES, levelFromTotal } from '@/lib/course'

export const dynamic = 'force-dynamic'

const GRADED = MODULES.flatMap(m => m.assignments).filter(a => a.graded)

export async function GET() {
  if (!(await isAdmin())) return new NextResponse('Forbidden', { status: 403 })

  const [{ data: students }, { data: subs }] = await Promise.all([
    supabase.from('students').select('id, full_name, study_group, university').order('full_name'),
    supabase.from('submissions').select('student_id, assignment_key, score'),
  ])

  const scores = new Map<string, Map<string, number>>()
  for (const s of subs ?? []) {
    if (s.score == null) continue
    if (!scores.has(s.student_id)) scores.set(s.student_id, new Map())
    scores.get(s.student_id)!.set(s.assignment_key, s.score)
  }

  const header = ['ФИО', 'Группа', 'Вуз', ...GRADED.map(a => `${a.key} (${a.points})`), 'Итого', 'Уровень']
  const rows = [header]

  for (const st of students ?? []) {
    const sm = scores.get(st.id)
    let total = 0
    const cells = GRADED.map(a => {
      const v = sm?.get(a.key)
      if (v != null) total += v
      return v ?? ''
    })
    rows.push([st.full_name, st.study_group, st.university, ...cells, total, levelFromTotal(total)])
  }

  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Ведомость')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="vedomost-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  })
}
