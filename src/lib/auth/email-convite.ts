import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'
import type { AmbienteConvite } from '@/lib/auth/convites'
import { urlBaseAuth } from '@/lib/auth/redirecionamento'
import { ROTAS } from '@/lib/rotas'

export type ResultadoEmailConvite =
  | { enviado: true; tipo: 'convite' | 'acesso' }
  | { enviado: false; erro: string }

function usuarioJaRegistrado(mensagem: string): boolean {
  const m = mensagem.toLowerCase()
  return (
    m.includes('already') ||
    m.includes('registered') ||
    m.includes('exists') ||
    m.includes('duplicate')
  )
}

/**
 * Envia e-mail de convite/acesso via Supabase Auth.
 * - Usuário novo: inviteUserByEmail (link para definir senha)
 * - Usuário existente: magic link para entrar no sistema
 */
export async function enviarEmailConviteAcesso(dados: {
  email: string
  nomeCompleto?: string
  ambiente: AmbienteConvite
}): Promise<ResultadoEmailConvite> {
  const admin = criarClienteSupabaseAdmin()
  const urlBase = urlBaseAuth()
  const callback = `${urlBase}/api/auth/callback?tipo=convite`

  const { error: erroConvite } = await admin.auth.admin.inviteUserByEmail(dados.email, {
    redirectTo: callback,
    data: {
      nome_completo: dados.nomeCompleto?.trim() ?? '',
      convite_ambiente: dados.ambiente,
    },
  })

  if (!erroConvite) {
    return { enviado: true, tipo: 'convite' }
  }

  if (!usuarioJaRegistrado(erroConvite.message)) {
    return {
      enviado: false,
      erro: erroConvite.message || 'Não foi possível enviar o e-mail de convite.',
    }
  }

  const { error: erroOtp } = await admin.auth.signInWithOtp({
    email: dados.email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${urlBase}${ROTAS.auth.entrar}`,
    },
  })

  if (erroOtp) {
    return {
      enviado: false,
      erro: erroOtp.message || 'Não foi possível enviar o link de acesso.',
    }
  }

  return { enviado: true, tipo: 'acesso' }
}
