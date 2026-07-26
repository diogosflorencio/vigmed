import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'
import { ehAdministrador, ehUsuarioEmpresa } from '@/lib/auth/sessao'
import type { AmbienteApp } from '@/lib/ambiente'
import type { PapelUsuario } from '@/types'

export type AmbienteConvite = 'adm' | 'docs'

export interface ConviteAcesso {
  id: string
  criado_em: string
  email: string
  nome_completo: string
  papel: PapelUsuario
  ambiente: AmbienteConvite
  empresa_id: string | null
  convidado_por: string | null
  usado_em: string | null
  usuario_id: string | null
  expira_em: string | null
  ativo: boolean
  observacoes: string | null
}

/** Normaliza e-mail para comparação consistente */
export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Verifica se o papel pode acessar o ambiente (adm ou docs) */
export function papelPermiteAmbiente(papel: PapelUsuario, ambiente: AmbienteApp): boolean {
  if (ambiente === 'adm') return ehAdministrador(papel)
  if (ambiente === 'docs') return ehUsuarioEmpresa(papel)
  return false
}

/** Busca convite pendente para o e-mail (independente do ambiente) */
export async function obterConvitePendente(email: string, ambiente?: AmbienteConvite) {
  const admin = criarClienteSupabaseAdmin()
  const emailNormalizado = normalizarEmail(email)

  let query = admin
    .from('convites_acesso')
    .select('*')
    .ilike('email', emailNormalizado)
    .eq('ativo', true)
    .is('usado_em', null)
    .order('criado_em', { ascending: false })
    .limit(5)

  if (ambiente) {
    query = query.eq('ambiente', ambiente)
  }

  const { data, error } = await query

  if (error || !data?.length) return null

  const agora = Date.now()
  const convite = data.find((c) => !c.expira_em || new Date(c.expira_em).getTime() > agora)
  return (convite ?? null) as ConviteAcesso | null
}

/** Valida convite antes do cadastro (server-side, service role) */
export async function validarConviteParaCadastro(email: string, ambiente?: AmbienteConvite) {
  const convite = await obterConvitePendente(email, ambiente)

  if (!convite) {
    return {
      valido: false as const,
      erro: 'Este e-mail não possui convite ativo. Solicite acesso ao administrador.',
    }
  }

  return { valido: true as const, convite }
}
