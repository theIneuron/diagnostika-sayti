'use server'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// To'g'ri javoblar faqat server tomonda — brauzerda ko'rinmaydi
const CORRECT_ANSWERS: Record<string, string> = {
  q1:  'Система управления обучением',
  q2:  'Moodle',
  q3:  'Мастерская (Workshop)',
  q4:  'Google',
  q5:  'GIFT/XML',
  q6:  'Искусственный интеллект',
  q7:  'ChatGPT',
  q8:  'Текстовый запрос пользователя к ИИ',
  q9:  'Уверенная генерация недостоверной информации',
  q10: 'Kahoot',
  q11: 'Электронных карточках с адаптивным повторением',
  q12: 'Сочетание очных занятий и онлайн-компонента',
  q13: 'Проверка грамматики и стиля текста',
  q14: 'Отслеживание прогресса и активности студентов',
  q15: 'Использование ИИ следует декларировать, сохраняя авторскую ответственность',
}

function scorePartA(answers: Record<string, string>): number {
  let correct = 0
  for (const [key, answer] of Object.entries(answers)) {
    if (CORRECT_ANSWERS[key] === answer) correct++
  }
  return Math.round((correct * 20) / 15 * 100) / 100
}

export interface SubmitTestInput {
  respondentId: string
  partAAnswers: Record<string, string>
  partBAnswer: string
  partCFileUrl: string | null
  partCLink: string | null
  partCExplanation: string
}

export interface SubmitTestResult {
  success: boolean
  error?: string
}

export async function submitTest(input: SubmitTestInput): Promise<SubmitTestResult> {
  const partAScore = scorePartA(input.partAAnswers)

  // part_c_link uchun alohida ustun yo'q — file_url ga birlashtirish
  const partCRef = input.partCFileUrl || input.partCLink || null

  const { error } = await supabase
    .from('respondents')
    .update({
      part_a_score:         partAScore,
      part_b_case:          1,
      part_b_answer:        input.partBAnswer || null,
      part_c_file_url:      partCRef,
      part_c_justification: input.partCExplanation || null,
    })
    .eq('id', input.respondentId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
