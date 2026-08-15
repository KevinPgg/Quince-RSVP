import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// Cliente de SERVIDOR unicamente. Usa la service_role key, que ignora RLS.
// Nunca importar este archivo desde un componente 'use client'.
let cached: SupabaseClient<Database> | null = null

export function supabaseAdmin(): SupabaseClient<Database> {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.'
    )
  }
  cached = createClient<Database>(url, key, { auth: { persistSession: false } })
  return cached
}
