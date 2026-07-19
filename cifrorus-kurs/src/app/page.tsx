'use client'

import Link from 'next/link'
import { useRef } from 'react'
import {
  motion,
  FadeUp,
  Stagger,
  StaggerItem,
  TiltCard,
  Magnetic,
  Counter,
  ScrollProgress,
  Parallax,
} from '@/components/motion'
import { useMotionValue, useSpring, useTransform } from 'framer-motion'

const MODULES = [
  { n: 1, title: 'Введение в цифровую экосистему', weeks: 'недели 1–3', hours: '14 ч.', accent: 'from-violet-500 to-indigo-500' },
  { n: 2, title: 'Проектирование цифрового курса', weeks: 'недели 4–9', hours: '24 ч.', accent: 'from-sky-500 to-cyan-500' },
  { n: 3, title: 'Инструменты ИИ', weeks: 'недели 10–14', hours: '20 ч.', accent: 'from-teal-500 to-emerald-500' },
  { n: 4, title: 'Управление и рефлексия', weeks: 'недели 15–18', hours: '14 ч.', accent: 'from-amber-500 to-orange-500' },
]

const FEATURES = [
  { icon: '📓', title: 'ИИ-дневник', text: 'Протокол каждого обращения к нейросети — уникальный элемент методики' },
  { icon: '🗂️', title: 'Портфолио', text: 'Все работы в одном месте — для рефлексии и защиты' },
  { icon: '💬', title: 'Форум', text: 'Обсуждение этики ИИ и ответы сокурсникам' },
  { icon: '🤖', title: 'ИИ-оценивание', text: 'Помощь эксперту в оценке открытых ответов по рубрике' },
]

const STATS = [
  { to: 72, suffix: '', label: 'часа курса' },
  { to: 18, suffix: '', label: 'недель' },
  { to: 4, suffix: '', label: 'модуля' },
  { to: 120, suffix: '', label: 'баллов максимум' },
]

const HERO_WORDS = ['Цифровые', 'технологии', 'в', 'обучении', 'русскому', 'языку']

export default function Home() {
  // Фоновые пятна следуют за курсором (мягкий параллакс мыши)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 40, damping: 18 })
  const sy = useSpring(my, { stiffness: 40, damping: 18 })
  const blob1x = useTransform(sx, v => v * 0.06)
  const blob1y = useTransform(sy, v => v * 0.06)
  const blob2x = useTransform(sx, v => v * -0.04)
  const blob2y = useTransform(sy, v => v * -0.04)
  const heroRef = useRef<HTMLDivElement>(null)

  function onMouse(e: React.MouseEvent) {
    const r = heroRef.current?.getBoundingClientRect()
    if (!r) return
    mx.set(e.clientX - (r.left + r.width / 2))
    my.set(e.clientY - (r.top + r.height / 2))
  }

  return (
    <main className="flex-1" onMouseMove={onMouse}>
      <ScrollProgress />

      {/* Шапка */}
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.1 }}
        className="glass sticky top-0 z-40"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-gray-900 tracking-tight">
            ЦифроРус<span className="text-gradient">-Курс</span>
          </span>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-white/70 transition-colors">
              Войти
            </Link>
            <Magnetic strength={0.25}>
              <Link href="/register" className="btn-primary inline-block px-4 py-2 text-sm font-semibold rounded-lg">
                Регистрация
              </Link>
            </Magnetic>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden">
        {/* Пятна, следующие за курсором */}
        <motion.div
          aria-hidden
          style={{ x: blob1x, y: blob1y }}
          className="pointer-events-none absolute -top-28 -left-28 w-96 h-96 rounded-full bg-violet-400/25 blur-3xl"
        />
        <motion.div
          aria-hidden
          style={{ x: blob2x, y: blob2y }}
          className="pointer-events-none absolute top-6 -right-24 w-96 h-96 rounded-full bg-indigo-400/25 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-cyan-300/20 blur-3xl"
        />

        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 16, delay: 0.25 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border border-violet-100 text-violet-600 text-xs font-medium shadow-sm backdrop-blur"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            Смешанное обучение · 72 ч. · 18 недель
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 110, damping: 16, delay: 0.35 }}
            className="mt-7 text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]"
          >
            <span className="text-gradient">ЦифроРус-Курс</span>
          </motion.h1>

          {/* Подзаголовок — пословное появление */}
          <p className="mt-5 text-xl sm:text-2xl font-semibold text-gray-800 flex flex-wrap justify-center gap-x-2">
            {HERO_WORDS.map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.55 + i * 0.07, type: 'spring', stiffness: 130, damping: 16 }}
              >
                {w}
              </motion.span>
            ))}
          </p>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, type: 'spring', stiffness: 110, damping: 16 }}
            className="mt-4 text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            Учебная платформа для формирования{' '}
            <span className="font-semibold text-gray-700">критической ИИ-грамотности</span> будущих учителей
            русского языка.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, type: 'spring', stiffness: 110, damping: 16 }}
            className="mt-9 flex items-center justify-center gap-3"
          >
            <Magnetic>
              <Link href="/register" className="btn-primary inline-block px-8 py-3.5 rounded-xl text-sm font-semibold">
                Войти в кабинет →
              </Link>
            </Magnetic>
            <a
              href="#modules"
              className="px-8 py-3.5 rounded-xl border border-gray-200 bg-white/60 text-gray-700 text-sm font-semibold hover:bg-white hover:-translate-y-0.5 transition-all"
            >
              О курсе
            </a>
          </motion.div>

          {/* Статистика-счётчики */}
          <Stagger gap={0.1} className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATS.map(s => (
              <StaggerItem key={s.label}>
                <div className="card p-4">
                  <p className="text-3xl font-extrabold text-gradient">
                    <Counter to={s.to} suffix={s.suffix} />
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">{s.label}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Модули */}
      <section id="modules" className="max-w-6xl mx-auto px-6 py-14 scroll-mt-20">
        <FadeUp>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">Структура курса</h2>
        </FadeUp>
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODULES.map(m => (
            <StaggerItem key={m.n}>
              <TiltCard className="card relative h-full p-5 will-change-transform">
                <motion.div
                  whileHover={{ rotate: [0, -6, 6, 0] }}
                  transition={{ duration: 0.5 }}
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${m.accent} text-white font-bold flex items-center justify-center mb-4 shadow-md`}
                >
                  {m.n}
                </motion.div>
                <p className="text-sm font-semibold text-gray-900 leading-snug">{m.title}</p>
                <p className="mt-2 text-xs text-gray-400">{m.weeks} · {m.hours}</p>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Возможности */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <FadeUp>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">Возможности платформы</h2>
        </FadeUp>
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(f => (
            <StaggerItem key={f.title}>
              <TiltCard className="card relative h-full p-5 will-change-transform">
                <motion.div
                  whileHover={{ scale: 1.25, rotate: 8 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 12 }}
                  className="text-3xl mb-3 inline-block"
                >
                  {f.icon}
                </motion.div>
                <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">{f.text}</p>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* CTA с параллаксом */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <FadeUp>
          <div className="relative overflow-hidden rounded-3xl p-12 text-center bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-600 shadow-lg">
            <Parallax speed={0.25} className="pointer-events-none absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
            <Parallax speed={-0.2} className="pointer-events-none absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
            <motion.h3
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 120, damping: 16 }}
              className="text-3xl font-bold text-white"
            >
              Готовы начать курс?
            </motion.h3>
            <p className="mt-2 text-violet-100 text-sm">Зарегистрируйтесь и получите доступ к личному кабинету.</p>
            <Magnetic>
              <Link
                href="/register"
                className="inline-block mt-7 px-8 py-3.5 rounded-xl bg-white text-violet-700 text-sm font-semibold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Создать аккаунт
              </Link>
            </Magnetic>
          </div>
        </FadeUp>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-10 text-center">
        <p className="text-xs text-gray-400">
          Авторская платформа диссертационного исследования · УзГУМЯ · старт — сентябрь 2026
        </p>
      </footer>
    </main>
  )
}
