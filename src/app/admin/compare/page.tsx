import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import WaveGroupedBar from '@/components/admin/charts/WaveGroupedBar'
import { LIKERT_STATEMENTS } from '@/types/anketa'
import { PART_A_QUESTIONS } from '@/types/test'

export const metadata: Metadata = { title: 'Анализ волн | ДиагКомп-Рус' }
export const dynamic = 'force-dynamic'

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

function avg(nums: number[]): number | null {
  if (!nums.length) return null
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length * 10) / 10
}

function pct(correct: number, total: number): number | null {
  if (!total) return null
  return Math.round((correct / total) * 100)
}

export default async function ComparePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await supabase.from('respondents').select<string, any>(
    'wave, total_score, part_a_score, part_b_score, part_c_score, level, ' +
    'b2_q1, b2_q2, b2_q3, b2_q4, b2_q5, b2_q6, part_a_answers'
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const all = (data ?? []) as any[]

  const w1 = all.filter(r => r.wave === 1 || r.wave == null)
  const w2 = all.filter(r => r.wave === 2)

  const w1Scored = w1.filter(r => r.total_score != null)
  const w2Scored = w2.filter(r => r.total_score != null)

  // --- 1. Umumiy statistika ---
  const stats = [
    { label: 'Количество респондентов', wave1: w1.length, wave2: w2.length },
    { label: 'Средний итоговый балл', wave1: avg(w1Scored.map(r => r.total_score)), wave2: avg(w2Scored.map(r => r.total_score)) },
    { label: 'Среднее по части А (макс. 20)', wave1: avg(w1.filter(r => r.part_a_score != null).map(r => r.part_a_score)), wave2: avg(w2.filter(r => r.part_a_score != null).map(r => r.part_a_score)) },
    { label: 'Среднее по части Б (макс. 30)', wave1: avg(w1.filter(r => r.part_b_score != null).map(r => r.part_b_score)), wave2: avg(w2.filter(r => r.part_b_score != null).map(r => r.part_b_score)) },
    { label: 'Среднее по части В (макс. 50)', wave1: avg(w1.filter(r => r.part_c_score != null).map(r => r.part_c_score)), wave2: avg(w2.filter(r => r.part_c_score != null).map(r => r.part_c_score)) },
  ]

  // --- 2. Darajalar taqsimoti ---
  const levels = ['Высокий', 'Средний', 'Низкий']
  const levelData = levels.map(lv => ({
    label: lv,
    wave1: w1Scored.filter(r => r.level === lv).length,
    wave2: w2Scored.filter(r => r.level === lv).length,
  }))

  // --- 3. Likert o'rtachalari ---
  const likertData = LIKERT_STATEMENTS.map((stmt, i) => {
    const key = `b2_q${i + 1}`
    const v1 = w1.map(r => r[key]).filter((v): v is number => v != null)
    const v2 = w2.map(r => r[key]).filter((v): v is number => v != null)
    const shortStmt = stmt.length > 36 ? stmt.slice(0, 36) + '…' : stmt
    return { label: shortStmt, wave1: avg(v1), wave2: avg(v2) }
  })

  // --- 4. Part A savol bo'yicha to'g'ri % ---
  const w1WithA = w1.filter(r => r.part_a_answers && typeof r.part_a_answers === 'object')
  const w2WithA = w2.filter(r => r.part_a_answers && typeof r.part_a_answers === 'object')
  const questionData = PART_A_QUESTIONS.map(q => {
    const c1 = w1WithA.filter(r => r.part_a_answers[q.id] === CORRECT_ANSWERS[q.id]).length
    const c2 = w2WithA.filter(r => r.part_a_answers[q.id] === CORRECT_ANSWERS[q.id]).length
    const shortText = q.text.length > 40 ? q.text.slice(0, 40) + '…' : q.text
    return {
      label: shortText,
      wave1: pct(c1, w1WithA.length),
      wave2: pct(c2, w2WithA.length),
    }
  })

  const hasWave2 = w2.length > 0

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Анализ волн</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Волна 1: <strong>{w1.length}</strong> респондентов
          {hasWave2
            ? <> · Волна 2: <strong>{w2.length}</strong> респондентов</>
            : <> · <span className="text-orange-500">Данные по волне 2 пока отсутствуют</span></>}
        </p>
      </div>

      {/* Umumiy jadval */}
      <Card title="Общие показатели">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-medium text-gray-500">Показатель</th>
                <th className="text-center py-2 text-xs font-medium text-indigo-600">Волна 1</th>
                <th className="text-center py-2 text-xs font-medium text-purple-600">Волна 2</th>
                {hasWave2 && <th className="text-center py-2 text-xs font-medium text-gray-500">Разница</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.map(s => {
                const diff = hasWave2 && s.wave1 != null && s.wave2 != null
                  ? Math.round((s.wave2 - s.wave1) * 10) / 10
                  : null
                return (
                  <tr key={s.label}>
                    <td className="py-2.5 text-gray-700">{s.label}</td>
                    <td className="py-2.5 text-center font-semibold text-indigo-700">{s.wave1 ?? '—'}</td>
                    <td className="py-2.5 text-center font-semibold text-purple-700">{s.wave2 ?? '—'}</td>
                    {hasWave2 && (
                      <td className={`py-2.5 text-center font-medium text-sm ${diff == null ? 'text-gray-300' : diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {diff == null ? '—' : diff > 0 ? `+${diff}` : `${diff}`}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Darajalar */}
      <Card title="Распределение по уровням — в разрезе волн">
        <WaveGroupedBar data={levelData} yMax={Math.max(w1.length, w2.length, 5)} height={220} />
      </Card>

      {/* Likert */}
      <Card title="Блок II — Сравнение самооценки (шкала Ликерта 1–5)">
        <p className="text-xs text-gray-500 mb-4">
          Среднее по каждому утверждению для волны 1 и волны 2.
        </p>
        <WaveGroupedBar data={likertData} yMax={5} height={280} />
      </Card>

      {/* Part A savollari */}
      <Card title="Часть А — доля правильных ответов по вопросам (%)">
        <p className="text-xs text-gray-500 mb-4">
          Динамика знаний между волной 1 и волной 2.
        </p>
        <WaveGroupedBar data={questionData} yMax={100} height={480} layout="vertical" />
      </Card>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
        {title}
      </h2>
      {children}
    </div>
  )
}
