// ============================================================
// Рубрики ИИ-оценивания открытых ответов (Части Б и В)
// Источник: критерии_оценивания/Rubrika_DiagKomp-Rus.xlsx + TZ_AI_DiagKomp-Rus.docx
// Каждая часть: 4 критерия × 0–3 балла = максимум 12.
// Уровни (по каждой части): 0–4 низкий · 5–8 средний · 9–12 высокий.
// ============================================================

import { PART_B_CASE } from '@/types/test'

// Версия рубрики — логируется вместе с оценкой для воспроизводимости (ТЗ §9)
export const RUBRIC_VERSION = 'v1-2026-06'

// Провайдер и модель ИИ выбираются через ENV AI_PROVIDER (anthropic | gemini).
// По умолчанию — Anthropic/Claude (соответствует ТЗ). Gemini — переключаемая
// альтернатива. Фактически использованная модель пишется в БД (ai_model).
export type AIProvider = 'anthropic' | 'gemini'

// ТЗ называет claude-sonnet-4-6; используем актуальный Sonnet (claude-sonnet-5).
export const ANTHROPIC_MODEL = 'claude-sonnet-5'
export const GEMINI_MODEL = 'gemini-2.5-flash'

export function activeProvider(): AIProvider {
  return process.env.AI_PROVIDER === 'gemini' ? 'gemini' : 'anthropic'
}

export function modelFor(provider: AIProvider): string {
  return provider === 'gemini' ? GEMINI_MODEL : ANTHROPIC_MODEL
}

export const MAX_PER_PART = 12

export interface RubricCriterion {
  name: string
  descriptors: [string, string, string, string] // индексы = 0,1,2,3 балла
}

export interface PartRubric {
  key: 'B' | 'C'
  partLabel: string
  task: string
  criteria: RubricCriterion[]
  // Часть В: критерий «Критическая ИИ-грамотность» учитывается, только если
  // респондент использовал ИИ; иначе максимум пересчитывается на 9.
  conditionalLastCriterion?: boolean
}

// ---- Часть Б «Применение знаний» (кейс Алишера) ----
export const RUBRIC_B: PartRubric = {
  key: 'B',
  partLabel: 'Часть Б «Применение знаний»',
  task: PART_B_CASE,
  criteria: [
    {
      name: 'Диагностика причины',
      descriptors: [
        'Причина не выясняется; респондент сразу «наказывает» или игнорирует.',
        'Названо намерение выяснить причину, но без конкретных инструментов.',
        'Предложен 1 диагностический инструмент (сообщение, форма, звонок).',
        'Системный подход: несколько способов выяснить причину (опрос + аналитика + личный контакт).',
      ],
    },
    {
      name: 'Релевантность цифровых инструментов',
      descriptors: [
        'Инструменты не названы или нерелевантны задаче.',
        'Назван 1 инструмент, слабо связанный с задачей.',
        'Названы релевантные инструменты (Google Forms, чат, аналитика LMS).',
        'Несколько уместных инструментов с учётом контекста Google Classroom.',
      ],
    },
    {
      name: 'Обоснование выбора',
      descriptors: [
        'Обоснование отсутствует.',
        'Обоснование общее, для всех инструментов сразу.',
        'Обоснован выбор большинства инструментов.',
        'Каждый инструмент обоснован методически и под конкретную цель.',
      ],
    },
    {
      name: 'Педагогическая и этическая адекватность',
      descriptors: [
        'Карательная позиция, игнорирование возможных причин.',
        'Нейтральная позиция без учёта обстоятельств студента.',
        'Поддерживающий тон, учитываются отдельные причины.',
        'Чуткий индивидуализированный подход: техдоступ, мотивация, личные обстоятельства.',
      ],
    },
  ],
}

// ---- Часть В «Практическое задание» ----
export const PART_C_TASK =
  'Создайте фрагмент интерактивного задания (тест/карточки/задание с ИИ), ' +
  'прикрепите файл или ссылку и дайте краткое обоснование (до 300 слов). ' +
  'ИИ оценивает ТЕКСТ обоснования; сам прикреплённый файл оценивается отдельно экспертом.'

export const RUBRIC_C: PartRubric = {
  key: 'C',
  partLabel: 'Часть В «Практическое задание»',
  task: PART_C_TASK,
  conditionalLastCriterion: true,
  criteria: [
    {
      name: 'Соответствие типу задания',
      descriptors: [
        'Интерактивный фрагмент не описан.',
        'Упомянут тип, но без содержания.',
        'Описан тип и базовое содержание (тест/карточки/ИИ-задание).',
        'Чётко описан тип, содержание и механика интерактивности.',
      ],
    },
    {
      name: 'Методическая обоснованность инструмента',
      descriptors: [
        'Обоснование выбора отсутствует.',
        'Названа причина выбора без связи с целью.',
        'Обоснование с опорой на удобство/доступность.',
        'Обоснование с опорой на дидактическую цель и аудиторию.',
      ],
    },
    {
      name: 'Дидактический потенциал',
      descriptors: [
        'Формальный фрагмент без учебной ценности.',
        'Есть тема, но нет проверяемого результата.',
        'Есть учебная цель и проверяемый результат.',
        'Продуманная учебная цель, проверяемый результат и интерактивность.',
      ],
    },
    {
      name: 'Критическая ИИ-грамотность',
      descriptors: [
        'ИИ использован без какой-либо рефлексии.',
        'Упомянут ИИ без оценки его вклада.',
        'Отмечен вклад ИИ и факт доработки.',
        'Полная рефлексия: вклад ИИ, доработка, ограничения (принцип критической ИИ-грамотности).',
      ],
    },
  ],
}

export function levelFromPercent(percent: number): 'низкий' | 'средний' | 'высокий' {
  // Шкала уровней в пересчёте на проценты: 0–33% низкий, 34–66% средний, 67–100% высокий
  // (соответствует 0–4 / 5–8 / 9–12 при максимуме 12).
  if (percent >= 67) return 'высокий'
  if (percent >= 34) return 'средний'
  return 'низкий'
}

export const SYSTEM_PROMPT =
  'Ты — эксперт по методике преподавания русского языка и цифровой дидактике. ' +
  'Оцени развёрнутый ответ респондента СТРОГО по заданной рубрике: каждый критерий — целое число 0–3. ' +
  'Будь строгим и последовательным. Опирайся ТОЛЬКО на текст ответа, ничего не додумывай. ' +
  'Если ответ пустой или не по теме — ставь 0 по всем критериям. ' +
  'Для каждого критерия дай краткое (1 предложение) обоснование балла и общий feedback на 1–2 предложения.'

// Формирует текст рубрики с дескрипторами для подстановки в промпт
function renderRubric(rubric: PartRubric): string {
  const lines = rubric.criteria.map(c => {
    const desc = c.descriptors.map((d, s) => `      ${s} — ${d}`).join('\n')
    return `  Критерий «${c.name}»:\n${desc}`
  })
  return lines.join('\n')
}

export function buildUserPrompt(rubric: PartRubric, answer: string): string {
  const parts = [
    `[ЗАДАНИЕ/КЕЙС]: ${rubric.task}`,
    '',
    `[РУБРИКА — ${rubric.partLabel}]:`,
    renderRubric(rubric),
    '',
    `[МАКСИМУМ]: ${MAX_PER_PART} баллов (4 критерия × 3).`,
  ]
  if (rubric.conditionalLastCriterion) {
    parts.push(
      'ОСОБОЕ ПРАВИЛО: критерий «Критическая ИИ-грамотность» учитывается, ТОЛЬКО если из текста ' +
      'обоснования видно, что респондент использовал ИИ. Если ИИ НЕ использовался — поставь по этому ' +
      'критерию 0, укажи это в комментарии, а в поле "max" верни 9 (пересчитай total и percent от 9).',
    )
  }
  parts.push(
    '',
    '[ФОРМАТ ОТВЕТА]: верни СТРОГО валидный JSON без markdown, вида:',
    '{"criteria":[{"name":"...","score":0-3,"comment":"..."}],"total":<сумма>,' +
    '"max":<12 или 9>,"percent":<0-100>,"level":"низкий|средний|высокий","feedback":"..."}',
    '',
    `[ОТВЕТ РЕСПОНДЕНТА]:`,
    answer,
  )
  return parts.join('\n')
}

// JSON Schema для structured outputs (гарантирует валидный разбираемый ответ)
export const EVAL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    criteria: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          score: { type: 'integer', enum: [0, 1, 2, 3] },
          comment: { type: 'string' },
        },
        required: ['name', 'score', 'comment'],
      },
    },
    total: { type: 'integer' },
    max: { type: 'integer' },
    percent: { type: 'integer' },
    level: { type: 'string', enum: ['низкий', 'средний', 'высокий'] },
    feedback: { type: 'string' },
  },
  required: ['criteria', 'total', 'max', 'percent', 'level', 'feedback'],
} as const

export interface CriterionResult {
  name: string
  score: number
  comment: string
}

export interface PartEvaluation {
  criteria: CriterionResult[]
  total: number
  max: number
  percent: number
  level: 'низкий' | 'средний' | 'высокий'
  feedback: string
}
