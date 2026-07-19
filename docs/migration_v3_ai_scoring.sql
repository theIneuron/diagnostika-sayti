-- ============================================================
-- MIGRATION v3 — ИИ-оценивание открытых ответов (Части Б и В)
-- Запустите в Supabase SQL Editor
-- ТЗ «Подключение ИИ-оценивания», раздел 8 «Хранение данных»
--
-- ИИ-баллы хранятся ОТДЕЛЬНО от ручных part_b_score / part_c_score.
-- Ручная шкала платформы (0–30 / 0–50) не меняется; ИИ пишет по
-- утверждённой рубрике (4 критерия × 0–3 = 0–12) в отдельные поля,
-- что позволяет посчитать согласованность эксперт vs ИИ (Cohen's κ).
-- ============================================================

ALTER TABLE respondents
  -- Полный структурированный ответ ИИ по рубрике (критерии, комментарии, уровень)
  ADD COLUMN IF NOT EXISTS ai_score_b        jsonb,       -- Часть Б («Применение знаний»)
  ADD COLUMN IF NOT EXISTS ai_score_c        jsonb,       -- Часть В («Практическое задание»)
  -- Итоговая сумма баллов по рубрике (0–12) — для быстрой статистики и расчёта κ
  ADD COLUMN IF NOT EXISTS ai_total_b        int2,
  ADD COLUMN IF NOT EXISTS ai_total_c        int2,
  -- Метаданные для воспроизводимости (раздел 9 ТЗ)
  ADD COLUMN IF NOT EXISTS ai_evaluated_at   timestamptz,
  ADD COLUMN IF NOT EXISTS ai_model          text,        -- версия модели (например claude-sonnet-5)
  ADD COLUMN IF NOT EXISTS ai_rubric_version text;        -- версия рубрики

-- ============================================================
-- Проверка:
-- SELECT id, ai_total_b, ai_total_c, ai_evaluated_at, ai_model
-- FROM respondents WHERE ai_evaluated_at IS NOT NULL;
-- ============================================================
