'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

const FREQ_COLORS: Record<string, string> = {
  'Каждый день': '#22c55e',
  'Несколько раз в неделю': '#6366f1',
  'Редко': '#f97316',
  'Никогда': '#ef4444',
}

const FREQ_KEYS = ['Каждый день', 'Несколько раз в неделю', 'Редко', 'Никогда']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ToolFrequencyBar({ data }: { data: any[] }) {
  if (!data.length) return <p className="text-sm text-gray-400 py-8 text-center">Нет данных</p>
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis dataKey="tool" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
        {FREQ_KEYS.map(key => (
          <Bar key={key} dataKey={key} stackId="a" fill={FREQ_COLORS[key]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
