import Link from "next/link";

const MODULES = [
  {
    n: 1,
    title: "Введение в цифровую экосистему обучения",
    weeks: "недели 1–3",
    hours: "14 ч.",
    accent: "from-violet-500 to-indigo-500",
  },
  {
    n: 2,
    title: "Проектирование цифрового курса",
    weeks: "недели 4–9",
    hours: "24 ч.",
    accent: "from-sky-500 to-cyan-500",
  },
  {
    n: 3,
    title: "Инструменты ИИ",
    weeks: "недели 10–14",
    hours: "20 ч.",
    accent: "from-teal-500 to-emerald-500",
  },
  {
    n: 4,
    title: "Управление и рефлексия",
    weeks: "недели 15–18",
    hours: "14 ч.",
    accent: "from-amber-500 to-orange-500",
  },
];

const FEATURES = [
  { icon: "📓", title: "ИИ-дневник студента", text: "Обязательный протокол каждого обращения к нейросети" },
  { icon: "🗂️", title: "Портфолио", text: "Все сданные работы в одном месте — для рефлексии и защиты" },
  { icon: "💬", title: "Форум", text: "Обсуждение этики ИИ и взаимные ответы сокурсников" },
  { icon: "🤖", title: "ИИ-оценивание", text: "Помощь эксперту в оценке открытых ответов по рубрике" },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-xs font-medium mb-6">
          Смешанное обучение · 72 ч. · 18 недель
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          «ЦифроРус-Курс»
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Учебная платформа курса «Цифровые технологии в обучении русскому языку».
          Формирование <span className="font-semibold text-gray-800">критической ИИ-грамотности</span> будущих
          учителей русского языка.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
          >
            Войти в кабинет
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Регистрация
          </Link>
        </div>
      </section>

      {/* Modules */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Структура курса</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODULES.map((m) => (
            <div key={m.n} className="rounded-2xl border border-gray-200 p-5 bg-white">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.accent} text-white font-bold flex items-center justify-center mb-3`}>
                {m.n}
              </div>
              <p className="text-sm font-semibold text-gray-900 leading-snug">{m.title}</p>
              <p className="mt-2 text-xs text-gray-400">
                {m.weeks} · {m.hours}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Возможности платформы</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="text-sm font-semibold text-gray-900">{f.title}</p>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-10 mt-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          Авторская платформа диссертационного исследования · УзГУМЯ · старт курса — сентябрь 2026
        </p>
      </footer>
    </main>
  );
}
