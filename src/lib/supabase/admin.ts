import { createClient } from '@supabase/supabase-js'

/**
 * Cliente com service role - APENAS no servidor (API routes, Server Actions).
 * Ignora RLS; usar com cuidado e sempre validar permissões antes.
 */
export function criarClienteSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !chave) {
    throw new Error('Credenciais admin do Supabase não configuradas')
  }

  return createClient(url, chave, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
