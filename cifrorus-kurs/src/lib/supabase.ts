// ============================================================
// Серверный клиент Supabase (только для server actions / route handlers).
// Использует SERVICE_ROLE_KEY и обходит RLS — поэтому НИКОГДА не должен
// импортироваться в клиентские ('use client') компоненты.
// ============================================================

import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } },
)
