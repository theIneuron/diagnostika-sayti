'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'

type Row = { q: string; label: string; pct: number; correct: number; total: number }

function Empty() {
  return <p className="text-sm text-gray-400 py-8 text-center">Ma'lumot yo'q</p>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as Row
  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', maxWidth: 260 }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{d.q}. {d.label}</p>
      <p>To'g'ri javob: {d.correct} / {d.total} ({d.pct}%)</p>
    </div>
  )
}

export default function QuestionDifficultyBar({ data }: { data: Row[] }) {
  if (data.length === 0) return <Empty />
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, left: 36, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
        <YAxis type="category" dataKey="q" tick={{ fontSize: 11 }} width={28} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine x={50} stroke="#e5e7eb" strokeDasharray="4 4" />
        <Bar dataKey="pct" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {data.map(d => (
            <Cell
              key={d.q}
              fill={d.pct >= 70 ? '#22c55e' : d.pct >= 40 ? '#eab308' : '#ef4444'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
