'use client'

const MAX_FILE_MB = 10
const MAX_WORDS = 300

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

interface Props {
  mode: 'file' | 'link'
  file: File | null
  link: string
  explanation: string
  onModeChange: (mode: 'file' | 'link') => void
  onFileChange: (file: File | null) => void
  onLinkChange: (link: string) => void
  onExplanationChange: (explanation: string) => void
  errors: Record<string, string>
}

export default function PartC({
  mode,
  file,
  link,
  explanation,
  onModeChange,
  onFileChange,
  onLinkChange,
  onExplanationChange,
  errors,
}: Props) {
  const wordCount = countWords(explanation)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    if (selected && selected.size > MAX_FILE_MB * 1024 * 1024) {
      alert(`Файл слишком большой. Максимальный размер: ${MAX_FILE_MB} МБ.`)
      e.target.value = ''
      return
    }
    onFileChange(selected)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Часть В. Практическое задание
        </h2>
        <p className="text-sm text-gray-500">
          Создайте фрагмент интерактивного задания (тест/карточки/задание с ИИ) и
          прикрепите файл или вставьте ссылку. Добавьте краткое обоснование.
        </p>
      </div>

      {/* Rejim tanlash */}
      <div className="flex gap-3">
        {(['file', 'link'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            className={`flex-1 py-2 px-4 text-sm rounded-lg border transition-colors ${
              mode === m
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                : 'border-gray-200 text-gray-600 hover:border-indigo-300'
            }`}
          >
            {m === 'file' ? 'Прикрепить файл' : 'Вставить ссылку'}
          </button>
        ))}
      </div>

      {/* Fayl yuklash */}
      {mode === 'file' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Файл{' '}
            <span className="text-gray-400 font-normal">
              (до {MAX_FILE_MB} МБ — документ, скриншот)
            </span>
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
            onChange={handleFile}
            className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {file && (
            <p className="mt-1 text-xs text-green-600">
              Выбран: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} МБ)
            </p>
          )}
          {errors.partCFile && (
            <p className="mt-1 text-xs text-red-500">{errors.partCFile}</p>
          )}
        </div>
      )}

      {/* Havola */}
      {mode === 'link' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ссылка на выполненное задание
          </label>
          <input
            type="url"
            value={link}
            onChange={e => onLinkChange(e.target.value)}
            placeholder="https://..."
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.partCLink ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.partCLink && (
            <p className="mt-1 text-xs text-red-500">{errors.partCLink}</p>
          )}
        </div>
      )}

      {/* Izoh */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Краткое обоснование{' '}
          <span className="text-gray-400 font-normal">(до {MAX_WORDS} слов)</span>
        </label>
        <textarea
          value={explanation}
          onChange={e => onExplanationChange(e.target.value)}
          rows={5}
          placeholder="Объясните, что именно вы создали и почему выбрали этот инструмент..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${wordCount > MAX_WORDS * 0.85 ? 'text-orange-500' : 'text-gray-400'}`}>
            {wordCount} / {MAX_WORDS} слов
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Часть В необязательна, но учитывается при подведении итогов исследования.
      </p>
    </div>
  )
}
