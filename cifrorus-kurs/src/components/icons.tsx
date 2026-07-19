// ============================================================
// Единый набор line-иконок (SVG, 24×24, stroke) для светлых
// внутренних страниц. Без 'use client' — работают и в серверных,
// и в клиентских компонентах.
// ============================================================

const p = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function IconBook() {
  return (
    <svg {...p}>
      <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

export function IconChat() {
  return (
    <svg {...p}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2.5 21.5z" />
      <path d="M8 10h8M8 13.5h5" />
    </svg>
  )
}

export function IconLayers() {
  return (
    <svg {...p}>
      <path d="m12 2.5 9.5 4.75L12 12 2.5 7.25z" />
      <path d="m2.5 12 9.5 4.75L21.5 12" />
      <path d="m2.5 16.75 9.5 4.75 9.5-4.75" />
    </svg>
  )
}

export function IconPen() {
  return (
    <svg {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  )
}

export function IconAward() {
  return (
    <svg {...p}>
      <circle cx="12" cy="8.5" r="5.5" />
      <path d="m15.2 12.9 1.3 8.1-4.5-2.7-4.5 2.7 1.3-8.1" />
    </svg>
  )
}

export function IconSparkles() {
  return (
    <svg {...p}>
      <path d="M12 3.5 13.8 9a2 2 0 0 0 1.2 1.2L20.5 12l-5.5 1.8A2 2 0 0 0 13.8 15L12 20.5 10.2 15A2 2 0 0 0 9 13.8L3.5 12 9 10.2A2 2 0 0 0 10.2 9z" />
      <path d="M19 3v3M17.5 4.5h3" />
    </svg>
  )
}

export function IconLogout() {
  return (
    <svg {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  )
}

export function IconArrowLeft() {
  return (
    <svg {...p}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

export function IconTable() {
  return (
    <svg {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M10 4v16" />
    </svg>
  )
}

export function IconDownload() {
  return (
    <svg {...p}>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}

export function IconCheck() {
  return (
    <svg {...p}>
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  )
}

// Тонированный бейдж для светлой темы
export function IconBadge({ tint, children }: { tint: string; children: React.ReactNode }) {
  return (
    <div className={`inline-flex w-10 h-10 items-center justify-center rounded-xl border ${tint}`}>
      {children}
    </div>
  )
}
