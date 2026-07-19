# ЦифроРус-Курс

Учебная веб-платформа курса «Цифровые технологии в обучении русскому языку»
(72 ч., 18 недель, 4 модуля, смешанное обучение). Вторая платформа проекта
рядом с диагностической «ДиагКомп-Рус» (`../diagnostika-komp`).

## Стек

Next.js 16 (App Router, Turbopack) · React 19 · Supabase · Tailwind v4.
ИИ-оценивание открытых ответов — Gemini / Claude (переключение через `AI_PROVIDER`).

## Запуск

```bash
npm install
npm run dev
```

Переменные окружения (`.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=...
# ИИ-оценивание
AI_PROVIDER=gemini            # или anthropic
GEMINI_API_KEY=...            # для Gemini
ANTHROPIC_API_KEY=...         # для Claude
```

## ИИ-движок

`src/lib/ai/` — перенесён из «ДиагКомп-Рус» и обобщён:

- `provider.ts` — выбор и вызов модели (Anthropic/Gemini)
- `rubric-engine.ts` — обобщённый движок: 4 критерия × 0–3, пересчёт в шкалу задания
- `rubrics.ts` — рубрики конкретных заданий курса (заполняются по мере разработки модулей)

## Деплой (Vercel)

Отдельный Vercel-проект, **Root Directory = `cifrorus-kurs`**.
