-- ============================================================
-- MIGRATION v2 — Supabase SQL Editor da ishga tushiring
-- Muammo: b2_q1..b2_q6, b3_lms, wave, part_a_answers ustunlari
--         va SELECT policy yetishmayapti
-- ============================================================

-- 1. Yangi ustunlar qo'shish (IF NOT EXISTS — mavjud bo'lsa zarar yo'q)
ALTER TABLE respondents
  ADD COLUMN IF NOT EXISTS wave            int2  DEFAULT 1,
  ADD COLUMN IF NOT EXISTS b2_q1           int2,
  ADD COLUMN IF NOT EXISTS b2_q2           int2,
  ADD COLUMN IF NOT EXISTS b2_q3           int2,
  ADD COLUMN IF NOT EXISTS b2_q4           int2,
  ADD COLUMN IF NOT EXISTS b2_q5           int2,
  ADD COLUMN IF NOT EXISTS b2_q6           int2,
  ADD COLUMN IF NOT EXISTS b3_lms          text,
  ADD COLUMN IF NOT EXISTS b3_interactive  text,
  ADD COLUMN IF NOT EXISTS b3_ai           text,
  ADD COLUMN IF NOT EXISTS part_a_answers  jsonb,
  ADD COLUMN IF NOT EXISTS part_b_case     int4,
  ADD COLUMN IF NOT EXISTS part_c_justification text,
  ADD COLUMN IF NOT EXISTS direction       text;

-- 2. RLS: anon SELECT ruxsati (diagrammalar va admin uchun)
DROP POLICY IF EXISTS "anon_select" ON respondents;
CREATE POLICY "anon_select"
  ON respondents FOR SELECT
  TO anon
  USING (true);

-- 3. INSERT va UPDATE ruxsatlari (mavjud bo'lsa ham xavfsiz)
DROP POLICY IF EXISTS "anon_insert" ON respondents;
CREATE POLICY "anon_insert"
  ON respondents FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_own" ON respondents;
CREATE POLICY "anon_update_own"
  ON respondents FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- 4. RLS yoqilganligini tekshirish
ALTER TABLE respondents ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tekshirish: quyidagi query respondentlar qaytarishi kerak
-- SELECT count(*) FROM respondents;
-- ============================================================
