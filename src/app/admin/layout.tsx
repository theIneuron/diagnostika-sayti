import Link from 'next/link'
import { logoutAdmin } from '@/app/actions/adminAuth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-52 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-200">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Панель управления</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">Диагностика</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/respondents"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Respondentlar
          </Link>
          <Link
            href="/admin/stats"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Statistika
          </Link>
          <Link
            href="/admin/charts"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Diagrammalar
          </Link>
          <Link
            href="/admin/compare"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            To'lqin tahlili
          </Link>
          <Link
            href="/admin/open-answers"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Ochiq javoblar
          </Link>
        </nav>

        <div className="p-3 border-t border-gray-200">
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="w-full px-3 py-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              Chiqish
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  )
}
