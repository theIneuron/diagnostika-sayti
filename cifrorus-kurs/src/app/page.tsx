import Link from 'next/link'
import { Reveal } from '@/components/Reveal'

const MODULES = [
  { n: 1, title: 'Введение в цифровую экосистему', weeks: 'недели 1–3', hours: '14 ч.', accent: 'from-violet-500 to-indigo-500' },
  { n: 2, title: 'Проектирование цифрового курса', weeks: 'недели 4–9', hours: '24 ч.', accent: 'from-sky-500 to-cyan-500' },
  { n: 3, title: 'Инструменты ИИ', weeks: 'недели 10–14', hours: '20 ч.', accent: 'from-teal-500 to-emerald-500' },
  { n: 4, title: 'Управление и рефлексия', weeks: 'недели 15–18', hours: '14 ч.', accent: 'from-amber-500 to-orange-500' },
]

const FEATURES = [
  { icon: '📓', title: 'ИИ-дневник', text: 'Протокол каждого обращения к нейросети' },
  { icon: '🗂️', title: 'Портфолио', text: 'Все работы в одном месте — для защиты' },
  { icon: '💬', title: 'Форум', text: 'Обсуждение этики ИИ с сокурсниками' },
  { icon: '🤖', title: 'ИИ-оценивание', text: 'Помощь эксперту в оценке по рубрике' },
]

export default function Home() {
  return (
    <main className="flex-1">
      {/* Шапка */}
      <header className="glass sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-gray-900 tracking-tight">ЦифроРус<span className="text-gradient">-Курс</span></span>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-white/70 transition-colors">
              Войти
            </Link>
            <Link href="/register" className="btn-primary px-4 py-2 text-sm font-semibold rounded-lg">
              Регистрация
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Декоративные плавающие пятна */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-violet-300/30 blur-3xl animate-float" />
        <div className="pointer-events-none absolute top-10 -right-16 w-72 h-72 rounded-full bg-indigo-300/30 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border border-violet-100 text-violet-600 text-xs font-medium shadow-sm backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            Смешанное обучение · 72 ч. · 18 недель
          </div>

          <h1 className="animate-fade-up delay-1 mt-6 text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
            <span className="text-gradient">ЦифроРус-Курс</span>
          </h1>

          <p className="animate-fade-up delay-2 mt-5 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Учебная платформа курса «Цифровые технологии в обучении русскому языку».
            Формирование <span className="font-semibold text-gray-800">критической ИИ-грамотности</span> будущих учителей.
          </p>

          <div className="animate-fade-up delay-3 mt-9 flex items-center justify-center gap-3">
            <Link href="/register" className="btn-primary px-7 py-3.5 rounded-xl text-sm font-semibold">
              Войти в кабинет
            </Link>
            <a href="#modules" className="px-7 py-3.5 rounded-xl border border-gray-200 bg-white/60 text-gray-700 text-sm font-semibold hover:bg-white transition-colors">
              О курсе
            </a>
          </div>
        </div>
      </section>

      {/* Модули */}
      <section id="modules" className="max-w-6xl mx-auto px-6 py-12 scroll-mt-20">
        <Reveal as="h2" className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
          Структура курса
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODULES.map((m, i) => (
            <Reveal key={m.n} delay={i * 80}>
              <div className="card card-hover h-full p-5">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${m.accent} text-white font-bold flex items-center justify-center mb-4 shadow-md`}>
                  {m.n}
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-snug">{m.title}</p>
                <p className="mt-2 text-xs text-gray-400">{m.weeks} · {m.hours}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Возможности */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <Reveal as="h2" className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
          Возможности платформы
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="card card-hover h-full p-5">
                <div className="text-3xl mb-3">{f.icon}</div>
                <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl p-10 text-center bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg">
            <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
            <h3 className="text-2xl font-bold text-white">Готовы начать курс?</h3>
            <p className="mt-2 text-violet-100 text-sm">Зарегистрируйтесь и получите доступ к личному кабинету.</p>
            <Link href="/register" className="inline-block mt-6 px-7 py-3 rounded-xl bg-white text-violet-700 text-sm font-semibold hover:bg-violet-50 transition-colors">
              Создать аккаунт
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Футер */}
      <footer className="max-w-6xl mx-auto px-6 py-10 text-center">
        <p className="text-xs text-gray-400">
          Авторская платформа диссертационного исследования · УзГУМЯ · старт — сентябрь 2026
        </p>
      </footer>
    </main>
  )
}
