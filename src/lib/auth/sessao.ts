import { criarClienteSupabaseServidor } from '@/lib/supabase/servidor'
import { obterPerfilPorIdServidor } from '@/lib/auth/perfil-servidor'
import type { Perfil, PapelUsuario } from '@/types'

const PAPEIS_ADMIN: PapelUsuario[] = ['administrador']
const PAPEIS_EMPRESA: PapelUsuario[] = ['administrador_empresa', 'usuario_empresa']

/** Busca o perfil completo do usuário autenticado */
export async function obterPerfilAtual(): Promise<Perfil | null> {
  const supabase = await criarClienteSupabaseServidor()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: perfil } = await supabase
    .from('perfis')
    .select('*, empresas(*)')
    .eq('id', user.id)
    .single()

  if (perfil) return perfil as Perfil

  // Sessão válida mas RLS bloqueou leitura - fallback servidor
  const perfilServidor = await obterPerfilPorIdServidor(user.id)
  return perfilServidor as Perfil | null
}

/** Verifica se o usuário tem papel administrativo */
export function ehAdministrador(papel: PapelUsuario): boolean {
  return PAPEIS_ADMIN.includes(papel)
}

/** Verifica se o usuário pertence a uma empresa (cliente) */
export function ehUsuarioEmpresa(papel: PapelUsuario): boolean {
  return PAPEIS_EMPRESA.includes(papel)
}

/**
 * Garante que o usuário está autenticado e tem o papel esperado.
 * Lança erro se não autorizado - usar em Server Actions e API routes.
 */
export async function exigirAutenticacao(papeisPermitidos?: PapelUsuario[]) {
  const perfil = await obterPerfilAtual()

  if (!perfil || !perfil.ativo) {
    throw new Error('Não autenticado')
  }

  if (papeisPermitidos && !papeisPermitidos.includes(perfil.papel)) {
    throw new Error('Sem permissão')
  }

  return perfil
}

/** Registra evento na tabela de auditoria */
export async function registrarAuditoria(dados: {
  acao: string
  usuarioId?: string
  empresaId?: string
  recurso?: string
  recursoId?: string
  detalhes?: Record<string, unknown>
  ip?: string
  userAgent?: string
}) {
  const supabase = await criarClienteSupabaseServidor()

  await supabase.from('auditoria').insert({
    acao: dados.acao,
    usuario_id: dados.usuarioId,
    empresa_id: dados.empresaId,
    recurso: dados.recurso,
    recurso_id: dados.recursoId,
    detalhes: dados.detalhes ?? {},
    endereco_ip: dados.ip,
    agente_usuario: dados.userAgent,
  })
}
