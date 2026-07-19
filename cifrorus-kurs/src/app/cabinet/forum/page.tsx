import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentStudent } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { NewPostForm, ReplyForm } from '@/components/ForumForms'

export const dynamic = 'force-dynamic'

interface Reply {
  id: string
  body: string
  created_at: string
  students: { full_name: string } | null
}
interface Post {
  id: string
  topic: string | null
  body: string
  created_at: string
  students: { full_name: string; study_group: string } | null
  forum_replies: Reply[]
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default async function ForumPage() {
  const student = await getCurrentStudent()
  if (!student) redirect('/login')

  const { data } = await supabase
    .from('forum_posts')
    .select('id, topic, body, created_at, students(full_name, study_group), forum_replies(id, body, created_at, students(full_name))')
    .order('created_at', { ascending: false })

  const posts = (data ?? []) as unknown as Post[]

  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href="/cabinet" className="text-sm text-gray-400 hover:text-gray-600">← В кабинет</Link>

        <div className="mt-4 mb-6">
          <h1 className="text-xl font-bold text-gray-900">💬 Форум — этика ИИ</h1>
          <p className="text-sm text-gray-500">
            Задание 1.3: опубликуйте пост и ответьте хотя бы одному сокурснику.
          </p>
        </div>

        <div className="mb-8">
          <NewPostForm />
        </div>

        {posts.length === 0 ? (
          <p className="text-sm text-gray-400">Пока нет постов — будьте первым.</p>
        ) : (
          <div className="space-y-4">
            {posts.map(p => {
              const replies = [...(p.forum_replies ?? [])].sort(
                (a, b) => +new Date(a.created_at) - +new Date(b.created_at),
              )
              return (
                <div key={p.id} className="rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900">{p.students?.full_name ?? '—'}</p>
                    <span className="text-xs text-gray-400">{fmt(p.created_at)}</span>
                  </div>
                  {p.topic && <p className="text-sm font-medium text-violet-700 mb-1">{p.topic}</p>}
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{p.body}</p>

                  {replies.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-2">
                      {replies.map(r => (
                        <div key={r.id} className="text-sm">
                          <span className="font-medium text-gray-700">{r.students?.full_name ?? '—'}:</span>{' '}
                          <span className="text-gray-700">{r.body}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <ReplyForm postId={p.id} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
