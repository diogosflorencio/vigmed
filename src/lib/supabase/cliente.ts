import { createBrowserClient } from '@supabase/ssr'
import { dominioCookieCompartilhado } from '@/lib/ambiente-edge'

/**
 * Cliente Supabase no browser.
 * Em produção com subdomínios, Domain=.raiz compartilha a sessão com adm/docs.
 * O callback OAuth e o /entrar ficam no mesmo host canônico (www).
 */
export function criarClienteSupabase() {
  const domain = dominioCookieCompartilhado()

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        ...(domain ? { domain } : {}),
      },
    },
  )
}
