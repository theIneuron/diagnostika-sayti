'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from 'recharts'

type Row = { univ: string; avg: number; count: number }

function Empty() {
  return <p className="text-sm text-gray-400 py-8 text-center">Baholangan respondentlar yo'q</p>
}

export default function UniversityScoreBar({ data }: { data: Row[] }) {
  if (data.length === 0) return <Empty />
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 24, right: 16, left: -10, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis dataKey="univ" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(v) => [`${v} ball`, "O'rtacha"]}
          labelFormatter={(l) => `${l} (n=${data.find(d => d.univ === String(l))?.count ?? ''})`}
        />
        <Bar dataKey="avg" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={60}>
          <LabelList dataKey="avg" position="top" style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
