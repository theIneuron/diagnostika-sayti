'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export type ScoreState = { error?: string; success?: boolean }

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function scoreRespondent(
  _prev: ScoreState,
  formData: FormData,
): Promise<ScoreState> {
  const id = formData.get('id') as string
  const partBScore = Math.min(30, Math.max(0, Number(formData.get('part_b_score')) || 0))
  const partCScore = Math.min(50, Math.max(0, Number(formData.get('part_c_score')) || 0))

  const supabase = getSupabase()

  const { data } = await supabase
    .from('respondents')
    .select('part_a_score')
    .eq('id', id)
    .single()

  // total_score — generated column, uni qo'lda yozib bo'lmaydi (DB o'zi hisoblaydi)
  const partAScore = data?.part_a_score ?? 0
  const totalScore = partAScore + partBScore + partCScore
  const level = totalScore >= 80 ? 'Высокий' : totalScore >= 50 ? 'Средний' : 'Низкий'

  const { error } = await supabase
    .from('respondents')
    .update({ part_b_score: partBScore, part_c_score: partCScore, level })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/respondents/${id}`)
  return { success: true }
}
