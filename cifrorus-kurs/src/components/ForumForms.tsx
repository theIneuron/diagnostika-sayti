'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createPost, createReply, type ForumState } from '@/app/actions/forum'

const initial: ForumState = {}

export function NewPostForm() {
  const [state, action, pending] = useActionState(createPost, initial)
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (state.success) ref.current?.reset()
  }, [state.success])

  return (
    <form ref={ref} action={action} className="rounded-2xl border border-gray-200 p-5 space-y-3">
      <p className="text-sm font-semibold text-gray-900">Новый пост</p>
      <input
        name="topic"
        placeholder="Тема (необязательно)"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
      <textarea
        name="body"
        rows={4}
        placeholder="Ваш пост об этике ИИ (200–250 слов)…"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60"
      >
        {pending ? 'Публикуем…' : 'Опубликовать'}
      </button>
    </form>
  )
}

export function ReplyForm({ postId }: { postId: string }) {
  const [state, action, pending] = useActionState(createReply, initial)
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (state.success) ref.current?.reset()
  }, [state.success])

  return (
    <form ref={ref} action={action} className="mt-3 flex items-start gap-2">
      <input type="hidden" name="post_id" value={postId} />
      <textarea
        name="body"
        rows={1}
        placeholder="Ответить сокурснику…"
        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="px-3 py-1.5 text-xs font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 shrink-0"
      >
        {pending ? '…' : 'Ответить'}
      </button>
      {state.error && <p className="text-xs text-red-600 self-center">{state.error}</p>}
    </form>
  )
}
