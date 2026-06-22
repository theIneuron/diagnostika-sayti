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

  const partAScore = data?.part_a_score ?? 0
  const totalScore = Math.round((partAScore + partBScore + partCScore) * 100) / 100
  const level = totalScore >= 80 ? 'Высокий' : totalScore >= 50 ? 'Средний' : 'Низкий'

  // total_score va level DB'da generated column bo'lishi mumkin (o'zi hisoblaydi),
  // shuning uchun avval hammasi bilan update qilamiz, muvaffaqiyatsiz bo'lsa — faqat B/C.
  const { error: fullError } = await supabase
    .from('respondents')
    .update({ part_b_score: partBScore, part_c_score: partCScore, total_score: totalScore, level })
    .eq('id', id)

  if (fullError) {
    // Generated column xatosi bo'lsa — faqat B va C ni yoz, DB o'zi hisoblaydi
    const { error: partialError } = await supabase
      .from('respondents')
      .update({ part_b_score: partBScore, part_c_score: partCScore })
      .eq('id', id)
    if (partialError) return { error: partialError.message }
  }

  revalidatePath(`/admin/respondents/${id}`)
  revalidatePath('/admin/respondents')
  revalidatePath('/admin/charts')
  revalidatePath('/admin/stats')
  revalidatePath('/admin')
  return { success: true }
}
