'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

type Row = { univ: string; partA: number; partB: number; partC: number }

function Empty() {
  return <p className="text-sm text-gray-400 py-8 text-center">Baholangan respondentlar yo'q</p>
}

export default function PartScoresBar({ data }: { data: Row[] }) {
  if (data.length === 0) return <Empty />
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis dataKey="univ" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="partA" name="A qismi (max 20)" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="partB" name="B qismi (max 30)" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="partC" name="V qismi (max 50)" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}
