'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { submitTask, autosaveDraft, type SubmissionState } from '@/app/actions/submissions'

const initial: SubmissionState = {}
const AUTOSAVE_MS = 2 * 60 * 1000 // каждые 2 минуты (ТЗ)

function collectContent(form: HTMLFormElement, kind?: 'text' | 'protocol'): Record<string, string> {
  const fd = new FormData(form)
  const g = (k: string) => String(fd.get(k) ?? '').trim()
  return kind === 'protocol'
    ? { prompt: g('prompt'), ai_response: g('ai_response'), rework: g('rework') }
    : { text: g('text'), link: g('link') }
}

export interface TaskContent {
  text?: string
  link?: string
  prompt?: string
  ai_response?: string
  rework?: string
}

export function TaskForm({
  assignmentKey,
  content,
  status,
  needsLink,
  kind,
}: {
  assignmentKey: string
  content: TaskContent
  status: string | null
  needsLink?: boolean
  kind?: 'text' | 'protocol'
}) {
  const [state, action, pending] = useActionState(submitTask, initial)
  const graded = status === 'graded'
  const formRef = useRef<HTMLFormElement>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const ta =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-50 disabled:text-gray-500'

  // Автосохранение черновика каждые 2 минуты (ТЗ, п. 3.1)
  useEffect(() => {
    if (graded) return
    const timer = setInterval(async () => {
      const form = formRef.current
      if (!form) return
      const content = collectContent(form, kind)
      if (!Object.values(content).some(v => v)) return // пусто — не сохраняем
      const res = await autosaveDraft(assignmentKey, content)
      if (res.ok) setSavedAt(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }))
    }, AUTOSAVE_MS)
    return () => clearInterval(timer)
  }, [assignmentKey, kind, graded])

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <input type="hidden" name="key" value={assignmentKey} />

      {kind === 'protocol' ? (
        <>
          <div className="flex items-start gap-2.5 text-xs text-violet-700 bg-violet-50 border border-violet-100 rounded-xl p-3.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
              <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
            </svg>
            <span>
              Протокол ИИ-дневника: зафиксируйте обращение к нейросети и его критическую переработку.
              Данные сохраняются в разделе «ИИ-дневник».
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">1. Ваш промпт (запрос к ИИ)</label>
            <textarea name="prompt" defaultValue={content.prompt ?? ''} rows={3} disabled={graded}
              placeholder="Что вы попросили у нейросети…" className={ta} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">2. Ответ ИИ</label>
            <textarea name="ai_response" defaultValue={content.ai_response ?? ''} rows={5} disabled={graded}
              placeholder="Что ответила нейросеть…" className={ta} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">3. Критическая переработка</label>
            <textarea name="rework" defaultValue={content.rework ?? ''} rows={5} disabled={graded}
              placeholder="Что вы изменили, что было неверным, ваш итоговый вариант…" className={ta} />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ваш ответ</label>
            <textarea name="text" defaultValue={content.text ?? ''} rows={10} disabled={graded}
              placeholder="Введите ответ на задание…" className={ta} />
          </div>
          {needsLink && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ссылка <span className="text-gray-400 font-normal">(на файл / курс / документ)</span>
              </label>
              <input name="link" type="url" defaultValue={content.link ?? ''} disabled={graded}
                placeholder="https://…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-50 disabled:text-gray-500" />
            </div>
          )}
        </>
      )}

      {state.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{state.error}</div>
      )}
      {state.success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
          {state.success}
        </div>
      )}

      {graded ? (
        <p className="text-sm text-gray-400 italic">Работа оценена — редактирование недоступно.</p>
      ) : (
        <div className="flex items-center gap-3">
          <button
            type="submit"
            name="intent"
            value="draft"
            disabled={pending}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {pending ? 'Сохранение…' : 'Сохранить черновик'}
          </button>
          <button
            type="submit"
            name="intent"
            value="submit"
            disabled={pending}
            className="px-5 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60"
          >
            Отправить на проверку
          </button>
          {savedAt && <span className="text-xs text-gray-400">Автосохранено в {savedAt}</span>}
        </div>
      )}
    </form>
  )
}
