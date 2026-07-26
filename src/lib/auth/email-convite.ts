import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'
import type { AmbienteConvite } from '@/lib/auth/convites'
import { urlBaseAuth } from '@/lib/auth/redirecionamento'
import { ROTAS } from '@/lib/rotas'
import { usuarioExisteNoAuth } from '@/lib/auth/usuario-auth'

export type ResultadoEmailConvite =
  | { enviado: true; tipo: 'acesso_novo' | 'acesso' }
  | { enviado: false; erro: string }

/**
 * Envia e-mail de convite/acesso via Supabase Auth.
 * - Usuário novo: magic link (conta só é criada ao clicar; Google/cadastro continuam possíveis)
 * - Usuário existente: magic link para entrar
 */
export async function enviarEmailConviteAcesso(dados: {
  email: string
  nomeCompleto?: string
  ambiente: AmbienteConvite
}): Promise<ResultadoEmailConvite> {
  const admin = criarClienteSupabaseAdmin()
  const urlBase = urlBaseAuth()
  const callback = `${urlBase}/api/auth/callback?tipo=convite`
  const metadados = {
    nome_completo: dados.nomeCompleto?.trim() ?? '',
    convite_ambiente: dados.ambiente,
  }

  const jaExiste = await usuarioExisteNoAuth(dados.email)

  const { error } = await admin.auth.signInWithOtp({
    email: dados.email,
    options: {
      shouldCreateUser: !jaExiste,
      emailRedirectTo: jaExiste ? `${urlBase}${ROTAS.auth.entrar}` : callback,
      data: metadados,
    },
  })

  if (error) {
    return {
      enviado: false,
      erro: error.message || 'Não foi possível enviar o e-mail de convite.',
    }
  }

  return { enviado: true, tipo: jaExiste ? 'acesso' : 'acesso_novo' }
}
