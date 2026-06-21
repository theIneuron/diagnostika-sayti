'use client'

import { useRouter } from 'next/navigation'

export default function WaveFilter({
  defaultValue,
  basePath,
}: {
  defaultValue: string
  basePath: string
}) {
  const router = useRouter()

  return (
    <select
      defaultValue={defaultValue}
      onChange={e => {
        router.push(e.target.value ? `${basePath}?wave=${e.target.value}` : basePath)
      }}
      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
    >
      <option value="">Barcha to'lqinlar</option>
      <option value="1">To'lqin 1</option>
      <option value="2">To'lqin 2</option>
    </select>
  )
}
