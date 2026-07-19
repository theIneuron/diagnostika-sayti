-- ============================================================
-- ЦифроРус-Курс — MIGRATION v1 (инициализация БД)
-- Запустите в Supabase SQL Editor (ОТДЕЛЬНЫЙ проект от ДиагКомп-Рус).
--
-- Структура курса (модули/задания) ЖЁСТКО задана в коде — в БД хранятся
-- только данные студентов: работы, ИИ-дневник, форум, рецензии.
-- Доступ к БД — только с сервера (server actions / API) через
-- SERVICE_ROLE_KEY. RLS включён и НЕ открыт для anon/public — студенты
-- никогда не обращаются к БД напрямую.
-- ============================================================

-- ---- Студенты (личный кабинет) ----
create table if not exists students (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  username      text unique not null,          -- логин для входа
  full_name     text not null,                 -- ФИО
  university    text not null,                 -- вуз (из списка 4)
  study_group   text not null,                 -- группа
  password_hash text not null,                 -- scrypt-хеш (соль внутри)
  role          text not null default 'student' -- student | teacher
);

-- ---- Сданные работы / черновики по заданиям ----
create table if not exists submissions (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references students(id) on delete cascade,
  assignment_key text not null,                 -- ключ задания: '1.1', 'm1-essay', '2.1' …
  content        jsonb,                         -- поля ответа (тексты, ссылки, таблицы)
  file_url       text,                          -- прикреплённый файл (Supabase Storage)
  status         text not null default 'draft', -- draft | submitted | graded
  submitted_at   timestamptz,
  -- оценка эксперта (преподаватель)
  score          int2,
  feedback       text,
  graded_at      timestamptz,
  graded_by      text,
  -- ИИ-оценка (движок src/lib/ai) — хранится ОТДЕЛЬНО от ручной
  ai_score       jsonb,
  ai_total       int2,
  ai_evaluated_at timestamptz,
  ai_model       text,
  updated_at     timestamptz not null default now(),
  unique (student_id, assignment_key)           -- одна работа на задание
);
create index if not exists idx_submissions_student on submissions(student_id);
create index if not exists idx_submissions_status  on submissions(status);

-- ---- ИИ-дневник (Модуль 3: протоколы обращения к нейросети) ----
create table if not exists ai_diary (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references students(id) on delete cascade,
  assignment_key text not null,
  prompt         text,          -- промпт к ИИ
  ai_response    text,          -- ответ ИИ
  rework         text,          -- критическая переработка
  created_at     timestamptz not null default now()
);
create index if not exists idx_ai_diary_student on ai_diary(student_id);

-- ---- Форум (Задание 1.3: пост + ответ сокурснику) ----
create table if not exists forum_posts (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  topic      text,
  body       text not null,
  created_at timestamptz not null default now()
);
create table if not exists forum_replies (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references forum_posts(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_forum_replies_post on forum_replies(post_id);

-- ---- Рецензирование (Задание 4.4) ----
create table if not exists reviews (
  id                   uuid primary key default gen_random_uuid(),
  reviewer_id          uuid not null references students(id) on delete cascade,
  target_submission_id uuid not null references submissions(id) on delete cascade,
  content              jsonb,
  approved             bool not null default false,
  created_at           timestamptz not null default now()
);
create index if not exists idx_reviews_target on reviews(target_submission_id);

-- ---- RLS: включаем, публичных политик НЕ создаём (доступ только service role) ----
alter table students      enable row level security;
alter table submissions   enable row level security;
alter table ai_diary      enable row level security;
alter table forum_posts   enable row level security;
alter table forum_replies enable row level security;
alter table reviews       enable row level security;

-- ============================================================
-- Проверка:
-- select table_name from information_schema.tables
-- where table_schema = 'public' order by table_name;
-- ============================================================
