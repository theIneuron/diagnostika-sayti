'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

type Row = { label: string; wave1: number | null; wave2: number | null }

type Props = {
  data: Row[]
  yMax?: number
  yLabel?: string
  formatter?: (v: number) => string
  height?: number
  layout?: 'horizontal' | 'vertical'
}

function Empty() {
  return <p className="text-sm text-gray-400 py-8 text-center">Ma'lumot yo'q</p>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill }}>
          {p.name}: {p.value != null ? p.value : '—'}
        </p>
      ))}
    </div>
  )
}

export default function WaveGroupedBar({
  data, yMax, height = 280, layout = 'horizontal',
}: Props) {
  if (data.length === 0) return <Empty />

  if (layout === 'vertical') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, left: 100, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
          <XAxis type="number" domain={[0, yMax ?? 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={96} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="wave1" name="To'lqin 1" fill="#6366f1" maxBarSize={14} radius={[0, 3, 3, 0]} />
          <Bar dataKey="wave2" name="To'lqin 2" fill="#a855f7" maxBarSize={14} radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, yMax ?? 'auto']} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="wave1" name="To'lqin 1" fill="#6366f1" maxBarSize={36} radius={[4, 4, 0, 0]} />
        <Bar dataKey="wave2" name="To'lqin 2" fill="#a855f7" maxBarSize={36} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
