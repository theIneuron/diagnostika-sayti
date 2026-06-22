'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from 'recharts'

type Row = { label: string; short: string; count: number; pct: number }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as Row
  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', maxWidth: 280 }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{d.label}</p>
      <p>Отметили: <strong>{d.count}</strong> чел. ({d.pct}%)</p>
    </div>
  )
}

export default function DifficultyBar({ data }: { data: Row[] }) {
  if (!data.length) return <p className="text-sm text-gray-400 py-8 text-center">Нет данных</p>
  return (
    <ResponsiveContainer width="100%" height={data.length * 46 + 40}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 52, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="short" width={160} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="pct" radius={[0, 4, 4, 0]} maxBarSize={28} fill="#6366f1">
          <LabelList
            dataKey="pct"
            position="right"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(v: any) => `${v}%`}
            style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
