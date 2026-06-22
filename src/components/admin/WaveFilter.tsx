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
      <option value="">Все волны</option>
      <option value="1">Волна 1</option>
      <option value="2">Волна 2</option>
    </select>
  )
}
