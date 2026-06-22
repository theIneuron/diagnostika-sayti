'use client'

import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

type Point = { x: number; y: number; univ: string; level: string }

const LEVEL_COLOR: Record<string, string> = {
  'Высокий': '#22c55e',
  'Средний': '#eab308',
  'Низкий':  '#ef4444',
  '—':       '#9ca3af',
}

const ALL_LEVELS = ['Высокий', 'Средний', 'Низкий', '—']

function Empty() {
  return <p className="text-sm text-gray-400 py-8 text-center">Baholangan respondentlar yo'q</p>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as Point
  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <p style={{ fontWeight: 600, marginBottom: 2 }}>{d.univ}</p>
      <p>Likert o'rtacha: {d.x}</p>
      <p>Umumiy ball: {d.y}</p>
      <p>Daraja: {d.level}</p>
    </div>
  )
}

export default function SelfVsActualScatter({ data }: { data: Point[] }) {
  if (data.length === 0) return <Empty />

  const grouped = ALL_LEVELS.reduce<Record<string, Point[]>>((acc, level) => {
    acc[level] = data.filter(p => (p.level || '—') === level)
    return acc
  }, {})

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="x"
          type="number"
          domain={[1, 5]}
          tick={{ fontSize: 11 }}
          label={{ value: "O'z-o'zini baholash (Likert 1–5)", position: 'insideBottom', offset: -20, fontSize: 11, fill: '#6b7280' }}
        />
        <YAxis
          dataKey="y"
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 11 }}
          label={{ value: 'Umumiy ball', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#6b7280' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
        {ALL_LEVELS.filter(l => grouped[l].length > 0).map(level => (
          <Scatter
            key={level}
            name={level}
            data={grouped[level]}
            fill={LEVEL_COLOR[level]}
            opacity={0.85}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  )
}
