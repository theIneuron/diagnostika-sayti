// ============================================================
// Структура курса «ЦифроРус-Курс» — ЖЁСТКО задана в коде (ТЗ, раздел 2).
// В БД хранятся только работы студентов (submissions), привязанные к
// assignment.key. Итоговая шкала — 120 баллов.
// ============================================================

export const UNIVERSITIES = [
  'Узбекский государственный университет мировых языков (УзГУМЯ)',
  'Национальный педагогический университет Узбекистана имени Низами',
  'Ферганский государственный университет',
  'Бухарский государственный университет',
] as const

export type CheckType = 'auto' | 'manual' | 'ai'

export interface Assignment {
  key: string // уникальный ключ (используется как submissions.assignment_key)
  title: string
  check: CheckType
  points?: number // баллы, если задание оценивается в итоговую шкалу
  graded?: boolean // входит ли в итоговые 120 баллов
  // 'protocol' — задание Модуля 3 с полями ИИ-дневника (промпт / ответ ИИ /
  // критическая переработка). Сохраняется в submissions.content и попадает
  // в раздел «ИИ-дневник».
  kind?: 'text' | 'protocol'
}

export interface CourseModule {
  n: number
  title: string
  weeks: string
  hours: string
  accent: string // tailwind-градиент для карточки
  assignments: Assignment[]
}

export const MODULES: CourseModule[] = [
  {
    n: 1,
    title: 'Введение в цифровую экосистему обучения',
    weeks: 'недели 1–3',
    hours: '14 ч.',
    accent: 'from-violet-500 to-indigo-500',
    assignments: [
      { key: '1.1', title: 'Сравнительная таблица LMS', check: 'manual' },
      { key: '1.2', title: 'Пример «галлюцинации» ИИ', check: 'manual' },
      { key: '1.3', title: 'Форумный пост (этика ИИ)', check: 'manual' },
      { key: '1.4', title: 'Конспект документов', check: 'manual' },
      { key: 'm1-test', title: 'Часть А — Тест (30 вопросов)', check: 'auto', points: 30, graded: true },
      { key: 'm1-essay', title: 'Часть Б — Эссе', check: 'ai', points: 20, graded: true },
    ],
  },
  {
    n: 2,
    title: 'Проектирование цифрового курса',
    weeks: 'недели 4–9',
    hours: '24 ч.',
    accent: 'from-sky-500 to-cyan-500',
    assignments: [
      { key: '2.1', title: 'Структура электронного курса', check: 'manual' },
      { key: '2.2', title: 'Три учебных задания', check: 'manual' },
      { key: '2.3', title: 'Рубрика оценивания', check: 'manual' },
      { key: '2.4', title: 'Интеграция мультимедиа', check: 'manual' },
      { key: 'm2-project', title: 'Итоговый проект — фрагмент курса', check: 'ai', points: 25, graded: true },
    ],
  },
  {
    n: 3,
    title: 'Инструменты ИИ',
    weeks: 'недели 10–14',
    hours: '20 ч.',
    accent: 'from-teal-500 to-emerald-500',
    assignments: [
      { key: '3.1', title: 'Структурирование с ИИ', check: 'manual', kind: 'protocol' },
      { key: '3.2', title: 'Стилистическая правка', check: 'manual', kind: 'protocol' },
      { key: '3.3', title: 'Перефразирование (зона риска)', check: 'manual', kind: 'protocol' },
      { key: '3.4', title: 'Верификация галлюцинаций', check: 'manual', kind: 'protocol' },
      { key: 'm3-essay', title: 'Итоговое рефлексивное эссе', check: 'ai', points: 25, graded: true },
    ],
  },
  {
    n: 4,
    title: 'Управление и рефлексия',
    weeks: 'недели 15–18',
    hours: '14 ч.',
    accent: 'from-amber-500 to-orange-500',
    assignments: [
      { key: '4.1', title: 'План учебной недели', check: 'manual' },
      { key: '4.2', title: 'Аналитический отчёт', check: 'manual' },
      { key: '4.3', title: 'Моделирование ситуаций', check: 'manual' },
      { key: '4.4', title: 'Рецензия на работу сокурсника', check: 'manual' },
      { key: 'm4-case', title: 'Итоговый кейс', check: 'ai', points: 20, graded: true },
    ],
  },
]

// Итоговая шкала (ТЗ 2.5): 120 баллов
export const TOTAL_MAX = MODULES.flatMap(m => m.assignments)
  .filter(a => a.graded)
  .reduce((s, a) => s + (a.points ?? 0), 0)

export function levelFromTotal(total: number): 'высокий' | 'средний' | 'низкий' {
  if (total >= 96) return 'высокий'
  if (total >= 60) return 'средний'
  return 'низкий'
}

// Плоский список всех заданий и быстрый доступ по ключу
export const ALL_ASSIGNMENTS: Assignment[] = MODULES.flatMap(m => m.assignments)
export function getAssignment(key: string): Assignment | undefined {
  return ALL_ASSIGNMENTS.find(a => a.key === key)
}
