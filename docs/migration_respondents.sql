-- Supabase SQL Editor da shu skriptni ishga tushiring.
-- Mavjud ustunlarga zarar yetkazmaydi (IF NOT EXISTS).

ALTER TABLE respondents
  ADD COLUMN IF NOT EXISTS wave_id        int4        DEFAULT 1,
  ADD COLUMN IF NOT EXISTS university     text,
  ADD COLUMN IF NOT EXISTS course         text,
  ADD COLUMN IF NOT EXISTS major          text,
  ADD COLUMN IF NOT EXISTS contact        text,
  ADD COLUMN IF NOT EXISTS consent        bool        DEFAULT false,

  -- Blok II: Likert 1–5
  ADD COLUMN IF NOT EXISTS likert_1       int2,
  ADD COLUMN IF NOT EXISTS likert_2       int2,
  ADD COLUMN IF NOT EXISTS likert_3       int2,
  ADD COLUMN IF NOT EXISTS likert_4       int2,
  ADD COLUMN IF NOT EXISTS likert_5       int2,
  ADD COLUMN IF NOT EXISTS likert_6       int2,

  -- Blok III: chastota
  ADD COLUMN IF NOT EXISTS freq_lms           text,
  ADD COLUMN IF NOT EXISTS freq_interactive   text,
  ADD COLUMN IF NOT EXISTS freq_ai            text,

  -- Blok IV: qiyinchiliklar (massiv)
  ADD COLUMN IF NOT EXISTS difficulties   text[],

  -- Blok V: ochiq savol
  ADD COLUMN IF NOT EXISTS open_answer    text,

  -- Test Part A
  ADD COLUMN IF NOT EXISTS part_a_answers jsonb,
  ADD COLUMN IF NOT EXISTS part_a_score   numeric,

  -- Test Part B (qo'lda baholanadi)
  ADD COLUMN IF NOT EXISTS part_b_answer  text,
  ADD COLUMN IF NOT EXISTS part_b_score   int4,

  -- Test Part C (qo'lda baholanadi)
  ADD COLUMN IF NOT EXISTS part_c_file_url    text,
  ADD COLUMN IF NOT EXISTS part_c_link        text,
  ADD COLUMN IF NOT EXISTS part_c_explanation text,
  ADD COLUMN IF NOT EXISTS part_c_score       int4,

  -- Yakuniy natija (admin ballarni qo'ygandan keyin hisoblanadi)
  ADD COLUMN IF NOT EXISTS total_score    numeric,
  ADD COLUMN IF NOT EXISTS level          text;

-- RLS: anonim foydalanuvchilar INSERT va UPDATE qila olsin
ALTER TABLE respondents ENABLE ROW LEVEL SECURITY;

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
