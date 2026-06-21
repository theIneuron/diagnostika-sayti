'use server'

import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function scoreRespondent(formData: FormData) {
  const id = formData.get('id') as string
  const partBScore = Math.min(30, Math.max(0, Number(formData.get('part_b_score')) || 0))
  const partCScore = Math.min(50, Math.max(0, Number(formData.get('part_c_score')) || 0))

  const { data } = await supabase
    .from('respondents')
    .select('part_a_score')
    .eq('id', id)
    .single()

  const totalScore = Math.round(((data?.part_a_score ?? 0) + partBScore + partCScore) * 100) / 100
  const level = totalScore >= 80 ? 'Высокий' : totalScore >= 50 ? 'Средний' : 'Низкий'

  await supabase
    .from('respondents')
    .update({ part_b_score: partBScore, part_c_score: partCScore, total_score: totalScore, level })
    .eq('id', id)

  redirect(`/admin/respondents/${id}`)
}
