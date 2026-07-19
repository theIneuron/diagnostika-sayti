'use client'

// ============================================================
// Библиотека моушн-примитивов (framer-motion) для всей платформы:
// FadeUp / Stagger — появление при скролле со spring-физикой
// TiltCard        — 3D-наклон карточки за курсором
// Magnetic        — «магнитная» кнопка, тянется к курсору
// Counter         — анимированный счётчик чисел
// ScrollProgress  — тонкий прогресс-бар чтения сверху
// Parallax        — элемент, плывущий при скролле
// ============================================================

import { useRef, useEffect, useState } from 'react'
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  type HTMLMotionProps,
} from 'framer-motion'

const springy = { type: 'spring', stiffness: 120, damping: 19, mass: 0.9 } as const

// ---- Появление снизу при попадании в вьюпорт ----
export function FadeUp({
  children,
  delay = 0,
  y = 26,
  ...rest
}: { children: React.ReactNode; delay?: number; y?: number } & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ ...springy, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

// ---- Стаггер-контейнер: дети появляются каскадом ----
export function Stagger({
  children,
  gap = 0.08,
  className,
}: { children: React.ReactNode; gap?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  )
}
export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 26, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: springy },
      }}
    >
      {children}
    </motion.div>
  )
}

// ---- 3D-наклон карточки за курсором + блик ----
export function TiltCard({
  children,
  className = '',
  max = 10,
  glowColor = 'rgba(124,58,237,0.10)',
}: { children: React.ReactNode; className?: string; max?: number; glowColor?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const glowX = useMotionValue(50)
  const glowY = useMotionValue(50)

  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    ry.set((px - 0.5) * 2 * max)
    rx.set(-(py - 0.5) * 2 * max)
    glowX.set(px * 100)
    glowY.set(py * 100)
  }
  function onLeave() {
    rx.set(0)
    ry.set(0)
  }

  const glow = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(320px circle at ${x}% ${y}%, ${glowColor}, transparent 65%)`,
  )

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', perspective: 800 }}
      whileHover={{ scale: 1.02 }}
      transition={springy}
      className={className}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: glow }}
      />
      {children}
    </motion.div>
  )
}

// ---- «Магнитная» обёртка (кнопки/иконки тянутся к курсору) ----
export function Magnetic({ children, strength = 0.35 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 })
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 })

  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  function onLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ x, y }} className="inline-block">
      {children}
    </motion.div>
  )
}

// ---- Анимированный счётчик ----
export function Counter({
  to,
  duration = 1.6,
  suffix = '',
  className,
}: { to: number; duration?: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    let raf: number
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000))
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setVal(Math.round(to * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])

  return (
    <span ref={ref} className={className}>
      {val}
      {suffix}
    </span>
  )
}

// ---- Тонкий прогресс-бар чтения сверху страницы ----
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24 })
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-50"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #7c3aed, #6366f1, #22b8cf)',
      }}
    />
  )
}

// ---- Параллакс при скролле ----
export function Parallax({
  children,
  speed = 0.3,
  className,
}: { children?: React.ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const yRaw = useTransform(scrollYProgress, [0, 1], [speed * 120, -speed * 120])
  const y = useSpring(yRaw, { stiffness: 100, damping: 30 })
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}

// Экспорт motion для точечных анимаций на страницах
export { motion }
