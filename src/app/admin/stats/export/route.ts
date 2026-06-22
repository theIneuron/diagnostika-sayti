import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import * as XLSX from 'xlsx'
import { LIKERT_STATEMENTS, DIFFICULTY_OPTIONS, FREQUENCY_TOOLS, FREQUENCY_OPTIONS } from '@/types/anketa'
import { PART_A_QUESTIONS } from '@/types/test'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CORRECT_ANSWERS: Record<string, string> = {
  q1: 'Система управления обучением', q2: 'Moodle', q3: 'Мастерская (Workshop)',
  q4: 'Google', q5: 'GIFT/XML', q6: 'Искусственный интеллект', q7: 'ChatGPT',
  q8: 'Текстовый запрос пользователя к ИИ', q9: 'Уверенная генерация недостоверной информации',
  q10: 'Kahoot', q11: 'Электронных карточках с адаптивным повторением',
  q12: 'Сочетание очных занятий и онлайн-компонента', q13: 'Проверка грамматики и стиля текста',
  q14: 'Отслеживание прогресса и активности студентов',
  q15: 'Использование ИИ следует декларировать, сохраняя авторскую ответственность',
}

const UNIV_SHORT: Record<string, string> = {
  'Узбекский государственный университет мировых языков (УзГУМЯ)': 'УзГУМЯ',
  'Национальный педагогический университет Узбекистана имени Низами': 'НПУ им. Низами',
  'Ферганский государственный университет': 'ФерГУ',
  'Бухарский государственный университет': 'БухГУ',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function descStats(nums: number[]): Record<string, number | string> {
  if (!nums.length) return { N: 0, Min: '—', Max: '—', M: '—', SD: '—', Me: '—' }
  const n = nums.length
  const mean = nums.reduce((a, b) => a + b, 0) / n
  const sorted = [...nums].sort((a, b) => a - b)
  const median = n % 2 === 0 ? (sorted[n/2-1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)]
  const variance = nums.reduce((a, b) => a + (b-mean)**2, 0) / (n > 1 ? n-1 : 1)
  return {
    N: n,
    Min: Math.round(sorted[0]*10)/10,
    Max: Math.round(sorted[n-1]*10)/10,
    M: Math.round(mean*10)/10,
    SD: Math.round(Math.sqrt(variance)*100)/100,
    Me: Math.round(median*10)/10,
  }
}

function pearson(x: number[], y: number[]): number | string {
  const n = Math.min(x.length, y.length)
  if (n < 3) return '—'
  const mx = x.slice(0,n).reduce((a,b)=>a+b,0)/n
  const my = y.slice(0,n).reduce((a,b)=>a+b,0)/n
  let num=0, dx=0, dy=0
  for (let i=0; i<n; i++) { num+=(x[i]-mx)*(y[i]-my); dx+=(x[i]-mx)**2; dy+=(y[i]-my)**2 }
  if (!dx || !dy) return '—'
  return Math.round(num/Math.sqrt(dx*dy)*1000)/1000
}

function cronbach(matrix: number[][]): number | string {
  const k = matrix.length, n = matrix[0]?.length ?? 0
  if (k < 2 || n < 2) return '—'
  const itemVars = matrix.map(col => { const m=col.reduce((a,b)=>a+b,0)/n; return col.reduce((a,b)=>a+(b-m)**2,0)/(n-1) })
  const totals = Array.from({length:n},(_,i)=>matrix.reduce((s,col)=>s+col[i],0))
  const tm = totals.reduce((a,b)=>a+b,0)/n
  const tv = totals.reduce((a,b)=>a+(b-tm)**2,0)/(n-1)
  if (!tv) return '—'
  return Math.round((k/(k-1))*(1-itemVars.reduce((a,b)=>a+b,0)/tv)*1000)/1000
}

export async function GET(request: NextRequest) {
  const wave = request.nextUrl.searchParams.get('wave')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = supabase.from('respondents').select<string, any>(
    'university, course, wave, level, total_score, part_a_score, part_b_score, part_c_score, ' +
    'b2_q1,b2_q2,b2_q3,b2_q4,b2_q5,b2_q6, b3_lms,b3_interactive,b3_ai, ' +
    'difficulties, part_a_answers'
  )
  if (wave) q = q.eq('wave', Number(wave))
  const { data } = await q

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []).map((r: any) => {
    if (r.part_b_score != null && r.part_c_score != null) {
      const t = Math.round(((r.part_a_score??0)+r.part_b_score+r.part_c_score)*100)/100
      return { ...r, total_score: r.total_score??t, level: r.level??(t>=80?'Высокий':t>=50?'Средний':'Низкий') }
    }
    return r
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any[]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scored = rows.filter((r: any) => r.part_b_score != null && r.part_c_score != null)

  const wb = XLSX.utils.book_new()

  function addSheet(name: string, aoa: (string | number)[][]) {
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    const widths = aoa[0]?.map((_, ci) => ({
      wch: Math.max(...aoa.map(row => String(row[ci]??'').length), 10)
    })) ?? []
    ws['!cols'] = widths
    XLSX.utils.book_append_sheet(wb, ws, name)
  }

  // --- 1. Tavsifiy statistika ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getN = (arr: any[], col: string) => arr.map((r:any)=>r[col]).filter((v:any):v is number=>v!=null)
  const ds1 = descStats(getN(rows,'part_a_score'))
  const ds2 = descStats(getN(scored,'part_b_score'))
  const ds3 = descStats(getN(scored,'part_c_score'))
  const ds4 = descStats(getN(scored,'total_score'))

  addSheet('1. Tavsifiy statistika', [
    ['Ko\'rsatkich','N','Min','Max','M','SD','Me'],
    ['Part A (max 20)',...Object.values(ds1)],
    ['Part B (max 30)',...Object.values(ds2)],
    ['Part C (max 50)',...Object.values(ds3)],
    ['Jami (max 100)', ...Object.values(ds4)],
    [],
    [`Jami respondentlar: ${rows.length} · Baholangan: ${scored.length} · Baholanmagan: ${rows.length-scored.length}`],
  ])

  // --- 2. Cronbach + Pearson ---
  const minLen = Math.min(...[1,2,3,4,5,6].map(i=>rows.filter((r:any)=>r[`b2_q${i}`]!=null).length))
  const likertMatrix = [1,2,3,4,5,6].map(i=>rows.map((r:any)=>r[`b2_q${i}`] as number|null).filter((v:any):v is number=>v!=null).slice(0,minLen))
  const alpha = cronbach(likertMatrix)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const likertAvgs = scored.map((r:any) => { const v=[1,2,3,4,5,6].map(i=>r[`b2_q${i}`] as number|null).filter((x:any):x is number=>x!=null); return v.length===6?v.reduce((a,b)=>a+b,0)/6:null }).filter((v:any):v is number=>v!=null)
  const corrRows = scored.filter((_:any,i:number)=>likertAvgs[i]!=null)

  addSheet('2. Cronbach + Korrelyatsiya', [
    ["Cronbach's α (Likert, 6 ta element)", alpha, '', 'Talqin: ≥0.90 ajoyib · ≥0.80 yaxshi · ≥0.70 qabul · <0.70 yomon'],
    [],
    ['Korrelyatsiya (Likert avg vs ...)', 'Pearson r', 'N', 'Talqin'],
    ['Part A', pearson(likertAvgs, corrRows.map((r:any)=>r.part_a_score??0)), corrRows.length, '|r|≥0.70 kuchli · ≥0.40 o\'rtacha · <0.20 deyarli yo\'q'],
    ['Part B', pearson(likertAvgs, corrRows.map((r:any)=>r.part_b_score)), corrRows.length, ''],
    ['Part C', pearson(likertAvgs, corrRows.map((r:any)=>r.part_c_score)), corrRows.length, ''],
    ['Jami', pearson(likertAvgs, corrRows.map((r:any)=>r.total_score)), corrRows.length, ''],
  ])

  // --- 3. Universitetlar solishtirmasi ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function groupRows(arr: any[], keyFn: (r:any)=>string) {
    const m: Record<string,{all:any[],sc:any[]}> = {}
    arr.forEach(r => { const k=keyFn(r)||"Noma'lum"; if(!m[k]) m[k]={all:[],sc:[]}; m[k].all.push(r); if(r.part_b_score!=null&&r.part_c_score!=null) m[k].sc.push(r) })
    return Object.entries(m).sort((a,b)=>b[1].all.length-a[1].all.length)
  }

  const univData = groupRows(rows, (r:any)=>UNIV_SHORT[r.university]??r.university)
  addSheet('3. Universitetlar', [
    ['Universitet','N','Baholangan','M','SD','Me','Yuqori','O\'rta','Past'],
    ...univData.map(([label,{all,sc}])=>{
      const ds=descStats(sc.map((r:any)=>r.total_score).filter(Boolean))
      const lv={H:0,M:0,L:0};sc.forEach((r:any)=>{if(r.level==='Высокий')lv.H++;else if(r.level==='Средний')lv.M++;else if(r.level==='Низкий')lv.L++})
      return [label,all.length,sc.length,ds.M,ds.SD,ds.Me,lv.H,lv.M,lv.L]
    })
  ])

  // --- 4. Kurslar solishtirmasi ---
  const courseData = groupRows(rows, (r:any)=>r.course)
  addSheet('4. Kurslar', [
    ['Kurs','N','Baholangan','M','SD','Me','Yuqori','O\'rta','Past'],
    ...courseData.map(([label,{all,sc}])=>{
      const ds=descStats(sc.map((r:any)=>r.total_score).filter(Boolean))
      const lv={H:0,M:0,L:0};sc.forEach((r:any)=>{if(r.level==='Высокий')lv.H++;else if(r.level==='Средний')lv.M++;else if(r.level==='Низкий')lv.L++})
      return [label,all.length,sc.length,ds.M,ds.SD,ds.Me,lv.H,lv.M,lv.L]
    })
  ])

  // --- 5. Likert o'rtachalari ---
  addSheet('5. Likert', [
    ['#','Ifoda','N','M','SD'],
    ...LIKERT_STATEMENTS.map((stmt,i)=>{
      const key=`b2_q${i+1}`; const vals=rows.map((r:any)=>r[key]).filter((v:any):v is number=>v!=null)
      const ds=descStats(vals)
      return [i+1, stmt, ds.N, ds.M, ds.SD]
    })
  ])

  // --- 6. Part A savollar ---
  const withA = rows.filter((r:any)=>r.part_a_answers&&typeof r.part_a_answers==='object')
  addSheet('6. Part A savollar', [
    ['#','Savol','To\'g\'ri javob','To\'g\'ri n','Jami n','%'],
    ...PART_A_QUESTIONS.map((q,i)=>{
      const correct=withA.filter((r:any)=>r.part_a_answers[q.id]===CORRECT_ANSWERS[q.id]).length
      const pct=withA.length?Math.round(correct/withA.length*100):0
      return [i+1, q.text, CORRECT_ANSWERS[q.id], correct, withA.length, pct]
    })
  ])

  // --- 7. Qiyinchiliklar ---
  addSheet('7. Qiyinchiliklar', [
    ['Qiyinchilik','N','%'],
    ...DIFFICULTY_OPTIONS.map(opt=>{
      const n=rows.filter((r:any)=>Array.isArray(r.difficulties)&&r.difficulties.includes(opt)).length
      return [opt, n, rows.length?Math.round(n/rows.length*100):0]
    }).sort((a,b)=>(b[1] as number)-(a[1] as number))
  ])

  // --- 8. Chastota (Blok III) ---
  const colMap: Record<string,string> = {lms:'b3_lms',interactive:'b3_interactive',ai:'b3_ai'}
  addSheet('8. Vositalar chastotasi', [
    ['Vosita','Chastota','N','%'],
    ...FREQUENCY_TOOLS.flatMap(tool=>
      FREQUENCY_OPTIONS.map(opt=>{
        const n=rows.filter((r:any)=>r[colMap[tool.key]]===opt).length
        return [tool.label, opt, n, rows.length?Math.round(n/rows.length*100):0]
      })
    )
  ])

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const date = new Date().toISOString().slice(0,10)
  const suffix = wave ? `_wave${wave}` : ''
  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="diagnostika_statistika_${date}${suffix}.xlsx"`,
    },
  })
}
