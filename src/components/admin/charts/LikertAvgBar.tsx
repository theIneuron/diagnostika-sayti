'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'

interface LikertItem { q: string; label: string; avg: number; n: number }

export default function LikertAvgBar({ data }: { data: LikertItem[] }) {
  if (!data.length) return <p className="text-sm text-gray-400 py-4 text-center">Нет данных</p>

  return (
    <ResponsiveContainer width="100%" height={data.length * 42 + 40}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 40, top: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="q" width={36} tick={{ fontSize: 12 }} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any, _: any, props: any) => [
            `${v} (n=${props.payload?.n ?? ''})`,
            props.payload?.label ?? '',
          ]}
        />
        <ReferenceLine x={3} stroke="#9ca3af" strokeDasharray="4 2" label={{ value: 'Среднее', position: 'top', fontSize: 10, fill: '#6b7280' }} />
        <Bar dataKey="avg" radius={[0, 4, 4, 0]} maxBarSize={26}>
          {data.map(d => (
            <Cell key={d.q} fill={d.avg >= 4 ? '#6366f1' : d.avg >= 3 ? '#a78bfa' : '#f87171'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
