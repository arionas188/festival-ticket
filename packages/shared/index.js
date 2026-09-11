// Shared Supabase client, used by both apps/tenant-site and apps/admin-dashboard.
// Each app still keeps its own .env with the same VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
// values (the anon key is public-by-design, safe to duplicate) — Vite loads env per-app-root,
// so this file expects the values to be passed in rather than reading import.meta.env itself,
// keeping it framework/build-tool agnostic.
import { createClient } from '@supabase/supabase-js'

export function createSupabaseClient(url, anonKey, options = {}) {
  return createClient(url, anonKey, options)
}

