'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export type ScoreState = { error?: string; success?: boolean }

function getSupabase() {
  // Use service role key if available (bypasses RLS), fall back to anon key.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
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

  // total_score va level DB'da generated column bo'lishi mumkin — avval hammasi bilan update.
  const { error: fullError, data: fullData } = await supabase
    .from('respondents')
    .update({ part_b_score: partBScore, part_c_score: partCScore, total_score: totalScore, level })
    .eq('id', id)
    .select('id')

  if (fullError || !fullData?.length) {
    // Generated column bloklagan yoki update kelmagan bo'lsa — faqat B/C bilan urinib ko'r
    const { error: partialError, data: partialData } = await supabase
      .from('respondents')
      .update({ part_b_score: partBScore, part_c_score: partCScore })
      .eq('id', id)
      .select('id')

    if (partialError) return { error: `DB xatosi: ${partialError.message}` }
    if (!partialData?.length) {
      return { error: "Ball saqlanmadi (0 qator yangilandi). Supabase RLS yoki SUPABASE_SERVICE_ROLE_KEY Vercel'da o'rnatilmagan bo'lishi mumkin." }
    }
  }

  revalidatePath(`/admin/respondents/${id}`)
  revalidatePath('/admin/respondents')
  revalidatePath('/admin/charts')
  revalidatePath('/admin/stats')
  revalidatePath('/admin')
  return { success: true }
}
