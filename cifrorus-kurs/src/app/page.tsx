'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, TiltCard, Magnetic, Counter, ScrollProgress, Stagger, StaggerItem, FadeUp } from '@/components/motion'
import { useMotionValue, useSpring, useTransform, useInView } from 'framer-motion'

// ============================================================
// Лендинг «ЦифроРус-Курс» — тёмная премиум-сцена:
// аврора + сетка + зерно, bento-грид с живыми мини-интерфейсами,
// бегущая строка инструментов, шаги модулей, свечение.
// ============================================================

const MARQUEE = [
  'Moodle', 'Google Classroom', 'ChatGPT', 'Gemini', 'Kahoot',
  'Quizlet', 'Canva', 'Google Forms', 'Telegram', 'YouTube', 'Miro', 'Padlet',
]

const MODULES = [
  { n: 1, title: 'Цифровая экосистема', sub: 'недели 1–3 · 14 ч.', color: 'from-violet-500 to-indigo-500' },
  { n: 2, title: 'Проектирование курса', sub: 'недели 4–9 · 24 ч.', color: 'from-sky-500 to-cyan-400' },
  { n: 3, title: 'Инструменты ИИ', sub: 'недели 10–14 · 20 ч.', color: 'from-teal-400 to-emerald-400' },
  { n: 4, title: 'Управление и рефлексия', sub: 'недели 15–18 · 14 ч.', color: 'from-amber-400 to-orange-400' },
]

const HERO_SUB = ['Платформа,', 'которая', 'учит', 'учить', '—', 'вместе', 'с', 'ИИ.']

export default function Home() {
  // Аврора следует за курсором
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 30, damping: 20 })
  const sy = useSpring(my, { stiffness: 30, damping: 20 })
  const b1x = useTransform(sx, v => v * 0.08)
  const b1y = useTransform(sy, v => v * 0.08)
  const b2x = useTransform(sx, v => v * -0.05)
  const b2y = useTransform(sy, v => v * -0.05)
  const sceneRef = useRef<HTMLDivElement>(null)

  function onMouse(e: React.MouseEvent) {
    const r = sceneRef.current?.getBoundingClientRect()
    if (!r) return
    mx.set(e.clientX - r.width / 2)
    my.set(e.clientY - 300)
  }

  return (
    <main ref={sceneRef} onMouseMove={onMouse} className="dark-scene noise relative flex-1 overflow-hidden">
      <ScrollProgress />

      {/* Фон: сетка + аврора */}
      <div aria-hidden className="bg-dots absolute inset-0" />
      <motion.div aria-hidden style={{ x: b1x, y: b1y }}
        className="aurora pointer-events-none absolute -top-40 left-[8%] w-[34rem] h-[34rem] rounded-full bg-violet-600/25 blur-[110px]" />
      <motion.div aria-hidden style={{ x: b2x, y: b2y }}
        className="aurora pointer-events-none absolute -top-20 right-[4%] w-[30rem] h-[30rem] rounded-full bg-indigo-500/20 blur-[110px]"
        transition={{ delay: 2 }} />
      <div aria-hidden
        className="aurora pointer-events-none absolute top-[42rem] left-[30%] w-[26rem] h-[26rem] rounded-full bg-cyan-500/10 blur-[110px]" />

      {/* Шапка */}
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="glass-dark sticky top-0 z-40"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold tracking-tight text-white">
            ЦифроРус<span className="text-shine">-Курс</span>
          </span>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-white/5 hover:text-white transition-colors">
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

      {/* ===== HERO ===== */}
      <section className="relative max-w-5xl mx-auto px-6 pt-24 pb-14 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.15 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[13px] text-gray-300 backdrop-blur"
        >
          <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400 text-emerald-400 ping" />
          Набор открыт · старт — сентябрь 2026
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ type: 'spring', stiffness: 90, damping: 16, delay: 0.3 }}
          className="mt-8 text-6xl sm:text-7xl font-extrabold tracking-tight leading-[1.02] text-white"
        >
          Цифро<span className="text-shine">Рус</span>-Курс
        </motion.h1>

        <p className="mt-6 text-2xl sm:text-3xl font-semibold text-gray-200 flex flex-wrap justify-center gap-x-2.5">
          {HERO_SUB.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.6 + i * 0.08, type: 'spring', stiffness: 130, damping: 15 }}
              className={w === 'ИИ.' ? 'text-shine' : ''}
            >
              {w}
            </motion.span>
          ))}
        </p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.35, duration: 0.7 }}
          className="mt-5 text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          «Цифровые технологии в обучении русскому языку» — 18-недельный курс смешанного обучения
          с формированием критической ИИ-грамотности.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, type: 'spring', stiffness: 110, damping: 15 }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <Magnetic>
            <Link href="/register" className="btn-primary inline-block px-8 py-4 rounded-2xl text-sm font-semibold">
              Начать обучение →
            </Link>
          </Magnetic>
          <a href="#platform"
            className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 text-gray-200 text-sm font-semibold hover:bg-white/10 hover:-translate-y-0.5 transition-all">
            Как устроено
          </a>
        </motion.div>

        {/* Статистика */}
        <Stagger gap={0.09} className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: 72, label: 'часа курса' },
            { to: 18, label: 'недель' },
            { to: 4, label: 'модуля' },
            { to: 120, label: 'баллов максимум' },
          ].map(s => (
            <StaggerItem key={s.label}>
              <div className="card-dark p-5">
                <p className="text-4xl font-extrabold text-white tabular-nums">
                  <Counter to={s.to} />
                </p>
                <p className="mt-1 text-xs text-gray-500">{s.label}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ===== Бегущая строка инструментов ===== */}
      <section className="relative py-6 marquee-mask">
        <div className="marquee-track gap-10 text-gray-600 text-sm font-medium">
          {[...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap">
              {t} <span className="w-1.5 h-1.5 rotate-45 rounded-[2px] bg-violet-500/50" />
            </span>
          ))}
        </div>
      </section>

      {/* ===== BENTO ===== */}
      <section id="platform" className="relative max-w-6xl mx-auto px-6 py-16 scroll-mt-20">
        <FadeUp>
          <p className="text-xs font-semibold text-violet-400/80 uppercase tracking-[0.25em] mb-3">Платформа</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10">Всё обучение — в одном месте</h2>
        </FadeUp>

        <div className="grid md:grid-cols-6 gap-4">
          {/* ИИ-дневник — большая карта с живым протоколом */}
          <TiltCard max={5} glowColor="rgba(167,139,250,0.14)" className="card-dark md:col-span-4 p-7 will-change-transform">
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div>
                <IconBadge tint="from-violet-500/25 to-indigo-500/10 border-violet-400/25 text-violet-300">
                  <IconBook />
                </IconBadge>
                <h3 className="mt-4 text-xl font-bold text-white">ИИ-дневник студента</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  Каждое обращение к нейросети фиксируется протоколом: промпт → ответ ИИ → критическая
                  переработка. Уникальный элемент авторской методики.
                </p>
              </div>
              <MiniProtocol />
            </div>
          </TiltCard>

          {/* ИИ-оценивание — кольцо */}
          <TiltCard max={7} glowColor="rgba(103,232,249,0.12)" className="card-dark md:col-span-2 p-7 will-change-transform">
            <IconBadge tint="from-cyan-500/25 to-sky-500/10 border-cyan-400/25 text-cyan-300">
              <IconSparkles />
            </IconBadge>
            <h3 className="mt-4 text-lg font-bold text-white">ИИ-оценивание</h3>
            <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
              Gemini оценивает работы по рубрике — эксперт принимает решение.
            </p>
            <ScoreRing />
          </TiltCard>

          {/* Форум — живой чат */}
          <TiltCard max={7} glowColor="rgba(167,139,250,0.14)" className="card-dark md:col-span-2 p-7 will-change-transform">
            <IconBadge tint="from-violet-500/25 to-fuchsia-500/10 border-violet-400/25 text-violet-300">
              <IconChat />
            </IconBadge>
            <h3 className="mt-4 text-lg font-bold text-white">Форум</h3>
            <MiniChat />
          </TiltCard>

          {/* Портфолио — веер работ */}
          <TiltCard max={7} glowColor="rgba(52,211,153,0.12)" className="card-dark md:col-span-2 p-7 group will-change-transform">
            <IconBadge tint="from-emerald-500/25 to-teal-500/10 border-emerald-400/25 text-emerald-300">
              <IconLayers />
            </IconBadge>
            <h3 className="mt-4 text-lg font-bold text-white">Портфолио</h3>
            <p className="mt-1.5 text-xs text-gray-400">Все работы курса — в одном месте, готовы к защите.</p>
            <div className="relative h-24 mt-5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="absolute left-1/2 top-2 w-32 h-20 rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] backdrop-blur transition-all duration-500 group-hover:shadow-xl"
                  style={{
                    transform: `translateX(-50%) rotate(${(i - 1) * 4}deg) translateY(${i * 4}px)`,
                    zIndex: 3 - i,
                  }}
                >
                  <div className="p-3 space-y-1.5">
                    <div className="h-1.5 w-16 rounded bg-white/20" />
                    <div className="h-1.5 w-20 rounded bg-white/10" />
                    <div className="h-1.5 w-12 rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </TiltCard>

          {/* 120 баллов — прогресс */}
          <TiltCard max={7} glowColor="rgba(251,191,36,0.12)" className="card-dark md:col-span-2 p-7 will-change-transform">
            <IconBadge tint="from-amber-500/25 to-orange-500/10 border-amber-400/25 text-amber-300">
              <IconAward />
            </IconBadge>
            <h3 className="mt-4 text-lg font-bold text-white">
              <Counter to={120} className="tabular-nums" /> баллов
            </h3>
            <p className="mt-1.5 text-xs text-gray-400">Тест · эссе · проект · кейс — прозрачная шкала уровней.</p>
            <ScoreBars />
          </TiltCard>
        </div>
      </section>

      {/* ===== Модули — шаги ===== */}
      <section className="relative max-w-6xl mx-auto px-6 py-16">
        <FadeUp>
          <p className="text-xs font-semibold text-violet-400/80 uppercase tracking-[0.25em] mb-3">Маршрут</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12">4 модуля · 18 недель</h2>
        </FadeUp>

        <ModuleFlow />
      </section>

      {/* ===== CTA ===== */}
      <section className="relative max-w-6xl mx-auto px-6 py-16">
        <FadeUp>
          <div className="relative overflow-hidden rounded-3xl p-12 text-center border border-violet-400/20 bg-gradient-to-b from-violet-600/20 to-indigo-600/10">
            <div aria-hidden className="aurora pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] rounded-full bg-violet-500/30 blur-[100px]" />
            <h3 className="relative text-3xl sm:text-4xl font-bold text-white">
              Начните учить <span className="text-shine">по-новому</span>
            </h3>
            <p className="relative mt-3 text-gray-300 text-sm">
              Регистрация занимает меньше минуты. Всё обучение — в личном кабинете.
            </p>
            <div className="relative mt-8">
              <Magnetic>
                <Link href="/register" className="btn-primary inline-block px-9 py-4 rounded-2xl text-sm font-semibold">
                  Создать аккаунт →
                </Link>
              </Magnetic>
            </div>
          </div>
        </FadeUp>
      </section>

      <footer className="relative border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-10 text-center">
          <p className="text-xs text-gray-500">
            Авторская платформа диссертационного исследования · УзГУМЯ · 2026
          </p>
        </div>
      </footer>
    </main>
  )
}

// ============================================================
// Иконки (line-style SVG) в градиентных бейджах — под тёмную сцену
// ============================================================

function IconBadge({ tint, children }: { tint: string; children: React.ReactNode }) {
  return (
    <div className={`inline-flex w-11 h-11 items-center justify-center rounded-xl border bg-gradient-to-br ${tint}`}>
      {children}
    </div>
  )
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

// Раскрытая книга — ИИ-дневник
function IconBook() {
  return (
    <svg {...iconProps}>
      <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

// Искры — ИИ-оценивание
function IconSparkles() {
  return (
    <svg {...iconProps}>
      <path d="M12 3.5 13.8 9a2 2 0 0 0 1.2 1.2L20.5 12l-5.5 1.8A2 2 0 0 0 13.8 15L12 20.5 10.2 15A2 2 0 0 0 9 13.8L3.5 12 9 10.2A2 2 0 0 0 10.2 9z" />
      <path d="M19 3v3M17.5 4.5h3" />
    </svg>
  )
}

// Диалог — форум
function IconChat() {
  return (
    <svg {...iconProps}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2.5 21.5z" />
      <path d="M8 10h8M8 13.5h5" />
    </svg>
  )
}

// Слои — портфолио
function IconLayers() {
  return (
    <svg {...iconProps}>
      <path d="m12 2.5 9.5 4.75L12 12 2.5 7.25z" />
      <path d="m2.5 12 9.5 4.75L21.5 12" />
      <path d="m2.5 16.75 9.5 4.75 9.5-4.75" />
    </svg>
  )
}

// Медаль — 120 баллов
function IconAward() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="8.5" r="5.5" />
      <path d="m15.2 12.9 1.3 8.1-4.5-2.7-4.5 2.7 1.3-8.1" />
    </svg>
  )
}

// ============================================================
// Живые мини-интерфейсы внутри bento-карт
// ============================================================

// Протокол ИИ-дневника — строки появляются по кругу
function MiniProtocol() {
  const lines = [
    { label: 'Промпт', text: 'Составь план урока по падежам…', color: 'text-violet-300', bar: 'bg-violet-400/70' },
    { label: 'Ответ ИИ', text: 'Вот структура из 5 этапов…', color: 'text-cyan-300', bar: 'bg-cyan-400/70' },
    { label: 'Переработка', text: 'Убрала п.3 — не по возрасту. Добавила игру.', color: 'text-emerald-300', bar: 'bg-emerald-400/70' },
  ]
  const period = 7
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3">
      {lines.map((l, i) => (
        <motion.div
          key={l.label}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0.35], y: [10, 0, 0, 0] }}
          transition={{ duration: period, times: [i * 0.12, i * 0.12 + 0.1, 0.86, 1], repeat: Infinity, repeatDelay: 0.6 }}
          className="flex items-start gap-2.5"
        >
          <span className={`mt-1 w-1 h-8 rounded-full ${l.bar}`} />
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${l.color}`}>{l.label}</p>
            <p className="text-xs text-gray-300">{l.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Чат форума — пузыри по кругу
function MiniChat() {
  const msgs = [
    { me: false, text: 'ИИ — помощник или костыль?' },
    { me: true, text: 'Инструмент. Вопрос в рефлексии' },
    { me: false, text: 'Согласна, главное — проверять!' },
  ]
  const period = 6.5
  return (
    <div className="mt-4 space-y-2.5">
      {msgs.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0.3], scale: [0.9, 1, 1, 1] }}
          transition={{ duration: period, times: [i * 0.16, i * 0.16 + 0.1, 0.85, 1], repeat: Infinity, repeatDelay: 0.6 }}
          className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-snug ${
            m.me
              ? 'ml-auto bg-violet-500/80 text-white rounded-br-sm'
              : 'bg-white/8 border border-white/10 text-gray-200 rounded-bl-sm'
          }`}
        >
          {m.text}
        </motion.div>
      ))}
    </div>
  )
}

// Кольцо оценки ИИ
function ScoreRing() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })
  const R = 34
  const C = 2 * Math.PI * R
  const target = 0.85
  return (
    <div ref={ref} className="mt-5 flex items-center justify-center">
      <div className="relative">
        <svg width="110" height="110" viewBox="0 0 110 110" className="-rotate-90">
          <circle cx="55" cy="55" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
          <motion.circle
            cx="55" cy="55" r={R} fill="none"
            stroke="url(#ringGrad)" strokeWidth="9" strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={inView ? { strokeDashoffset: C * (1 - target) } : {}}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#67e8f9" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-white tabular-nums">
            <Counter to={17} duration={1.8} />
          </span>
          <span className="text-[10px] text-gray-500">из 20</span>
        </div>
      </div>
    </div>
  )
}

// Полоски компонентов итоговой оценки
function ScoreBars() {
  const bars = [
    { label: 'Тест', v: 30, color: 'bg-violet-400' },
    { label: 'Эссе', v: 20, color: 'bg-indigo-400' },
    { label: 'Проекты', v: 50, color: 'bg-cyan-400' },
    { label: 'Кейс', v: 20, color: 'bg-amber-400' },
  ]
  const max = 50
  return (
    <div className="mt-5 space-y-2.5">
      {bars.map((b, i) => (
        <div key={b.label} className="flex items-center gap-2.5">
          <span className="w-14 text-[10px] text-gray-500">{b.label}</span>
          <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(b.v / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className={`h-full rounded-full ${b.color}`}
            />
          </div>
          <span className="w-6 text-right text-[10px] text-gray-400 tabular-nums">{b.v}</span>
        </div>
      ))}
    </div>
  )
}

// Шаги модулей с растущей линией
function ModuleFlow() {
  return (
    <div className="relative">
      {/* Линия-коннектор */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '0px 0px -80px 0px' }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:block absolute top-9 left-[6%] right-[6%] h-px origin-left bg-gradient-to-r from-violet-500/60 via-cyan-400/50 to-amber-400/60"
      />
      <Stagger gap={0.14} className="grid md:grid-cols-4 gap-4">
        {MODULES.map(m => (
          <StaggerItem key={m.n}>
            <TiltCard max={6} glowColor="rgba(167,139,250,0.12)" className="card-dark relative p-6 will-change-transform">
              <div className={`relative z-10 w-[4.5rem] h-[4.5rem] rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center shadow-lg`}>
                <span className="text-2xl font-extrabold text-white">{m.n}</span>
              </div>
              <h3 className="mt-4 font-bold text-white leading-snug">{m.title}</h3>
              <p className="mt-1.5 text-xs text-gray-500">{m.sub}</p>
            </TiltCard>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  )
}
