'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts'

type Row = { range: string; count: number }

function getColor(range: string): string {
  const start = parseInt(range)
  if (start >= 80) return '#22c55e'
  if (start >= 50) return '#eab308'
  return '#ef4444'
}

export default function ScoreHistogram({ data }: { data: Row[] }) {
  if (!data.length || data.every(d => d.count === 0)) {
    return <p className="text-sm text-gray-400 py-8 text-center">Нет оценённых анкетируемых</p>
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 20, right: 16, left: -10, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis dataKey="range" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip formatter={(v) => [v, 'Анкетируемых']} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50}>
          <LabelList dataKey="count" position="top" style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }} />
          {data.map(d => (
            <Cell key={d.range} fill={getColor(d.range)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
