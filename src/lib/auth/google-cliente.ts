'use client'

import { criarClienteSupabase } from '@/lib/supabase/cliente'
import { urlOrigemAuthCanonica } from '@/lib/ambiente-edge'

function origemRedirectOAuth(): string {
  // Em produção, SITE_URL (www) deve ser o domínio primário da Vercel.
  // Em dev, usa o host atual (localhost).
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    return window.location.origin
  }

  try {
    const canonica = urlOrigemAuthCanonica().replace(/\/+$/, '')
    if (typeof window !== 'undefined') {
      const atual = window.location.origin.replace(/\/+$/, '')
      // Se o usuário já está no host canônico, preferir origin (mesmo host do cookie PKCE)
      if (atual === canonica) return atual
      // Apex vs www do mesmo site: manter host atual (cookie Domain=.raiz cobre os dois)
      const raiz = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vigmed.com.br').toLowerCase()
      const host = window.location.hostname.toLowerCase()
      if (host === raiz || host === `www.${raiz}`) return atual
    }
    return canonica
  } catch {
    return typeof window !== 'undefined' ? window.location.origin : ''
  }
}

/**
 * Login Google no browser (redirect na mesma aba).
 * Não sobrescreve redirect_to na URL do provedor (o SDK já inclui o valor certo).
 */
export async function entrarComGoogleNoCliente(): Promise<{ ok: false; erro: string } | void> {
  const supabase = criarClienteSupabase()
  const redirectTo = `${origemRedirectOAuth()}/api/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  })

  if (error || !data.url) {
    return { ok: false, erro: 'Não foi possível iniciar login com Google.' }
  }

  window.location.assign(data.url)
}
