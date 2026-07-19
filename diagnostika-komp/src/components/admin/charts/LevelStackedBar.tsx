'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

type Row = { univ: string; Высокий?: number; Средний?: number; Низкий?: number }

function Empty() {
  return <p className="text-sm text-gray-400 py-8 text-center">Нет оценённых анкетируемых</p>
}

export default function LevelStackedBar({ data }: { data: Row[] }) {
  if (data.length === 0) return <Empty />
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis dataKey="univ" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Высокий" stackId="a" fill="#22c55e" />
        <Bar dataKey="Средний" stackId="a" fill="#eab308" />
        <Bar dataKey="Низкий"  stackId="a" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  )
}
