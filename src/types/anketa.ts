export interface AnketaFormData {
  // Blok I
  university: string
  course: string
  major: string
  contact: string
  consent: boolean

  // Blok II — Likert 1–5 (6 ta savol)
  likert: Record<string, number>

  // Blok III — chastota (3 ta qator)
  frequency: Record<string, string>

  // Blok IV — qiyinchiliklar (tanlangan massiv)
  difficulties: string[]

  // Blok V — ochiq savol
  openAnswer: string
}

export const INITIAL_FORM_DATA: AnketaFormData = {
  university: '',
  course: '',
  major: '',
  contact: '',
  consent: false,
  likert: {},
  frequency: {},
  difficulties: [],
  openAnswer: '',
}

export type FormStep = 1 | 2 | 3 | 4 | 5

export const UNIVERSITIES = [
  'Узбекский государственный университет мировых языков (УзГУМЯ)',
  'Национальный педагогический университет Узбекистана имени Низами',
  'Ферганский государственный университет',
  'Бухарский государственный университет',
]

export const COURSES = ['3 курс', '4 курс', 'магистратура']

export const LIKERT_STATEMENTS = [
  'Я умею размещать материалы в LMS (Moodle/Google Classroom)',
  'Я умею создавать тесты в LMS',
  'Я умею создавать интерактивные задания (Kahoot, Quizlet, Wordwall)',
  'Я умею пользоваться ChatGPT/другими ИИ для учебных задач',
  'Я умею оценивать письменные работы с помощью цифровых инструментов',
  'Я могу самостоятельно спроектировать цифровой урок «с нуля»',
]

export const FREQUENCY_TOOLS = [
  { key: 'lms', label: 'LMS-платформы (Moodle, Google Classroom)' },
  { key: 'interactive', label: 'Интерактивные платформы (Kahoot, Quizlet, Wordwall)' },
  { key: 'ai', label: 'ИИ-инструменты (ChatGPT и подобные)' },
]

export const FREQUENCY_OPTIONS = [
  'Каждый день',
  'Несколько раз в неделю',
  'Редко',
  'Никогда',
]

export const DIFFICULTY_OPTIONS = [
  'Создание собственных интерактивных заданий',
  'Применение ИИ для подготовки уроков',
  'Оценивание работ учащихся в цифровой форме',
  'Технические проблемы (интернет, устройства)',
  'Не хватает практических занятий по этой теме',
]
