'use client'

import type { AnketaFormData } from '@/types/anketa'
import { UNIVERSITIES, COURSES } from '@/types/anketa'

interface Props {
  data: AnketaFormData
  onChange: (field: keyof AnketaFormData, value: string | boolean) => void
  errors: Record<string, string>
}

export default function BlockI({ data, onChange, errors }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Блок I. Общие сведения
        </h2>
        <p className="text-sm text-gray-500">
          Все поля обязательны для заполнения, кроме контактных данных.
        </p>
      </div>

      {/* Vuz */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Вуз <span className="text-red-500">*</span>
        </label>
        <select
          value={data.university}
          onChange={e => onChange('university', e.target.value)}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.university ? 'border-red-400' : 'border-gray-300'
          }`}
        >
          <option value="">— Выберите вуз —</option>
          {UNIVERSITIES.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        {errors.university && (
          <p className="mt-1 text-xs text-red-500">{errors.university}</p>
        )}
      </div>

      {/* Kurs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Курс <span className="text-red-500">*</span>
        </label>
        <select
          value={data.course}
          onChange={e => onChange('course', e.target.value)}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.course ? 'border-red-400' : 'border-gray-300'
          }`}
        >
          <option value="">— Выберите курс —</option>
          {COURSES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.course && (
          <p className="mt-1 text-xs text-red-500">{errors.course}</p>
        )}
      </div>

      {/* Yo'nalish */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Направление подготовки <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.major}
          onChange={e => onChange('major', e.target.value)}
          placeholder="Например: Русский язык и литература"
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.major ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {errors.major && (
          <p className="mt-1 text-xs text-red-500">{errors.major}</p>
        )}
      </div>

      {/* Aloqa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email или Telegram{' '}
          <span className="text-gray-400 font-normal">(необязательно)</span>
        </label>
        <input
          type="text"
          value={data.contact}
          onChange={e => onChange('contact', e.target.value)}
          placeholder="email@example.com или @username"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Rozilik */}
      <div className={`p-4 rounded-lg border ${errors.consent ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.consent}
            onChange={e => onChange('consent', e.target.checked)}
            className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">
            Я согласен(на) на обработку данных в обезличенном виде для научных целей.
          </span>
        </label>
        {errors.consent && (
          <p className="mt-2 text-xs text-red-500">{errors.consent}</p>
        )}
      </div>
    </div>
  )
}
