'use server'

import { exigirAutenticacao } from '@/lib/auth/sessao'
import { criarClienteSupabaseServidor } from '@/lib/supabase/servidor'
import type { AcaoAuditoria } from '@/types'

export interface RegistroAuditoria {
  id: string
  criado_em: string
  acao: AcaoAuditoria
  endereco_ip: string | null
  detalhes: Record<string, unknown>
  recurso: string | null
  recurso_id: string | null
  perfis?: { email: string; nome_completo: string } | null
  empresas?: { nome_fantasia: string } | null
}

export interface FiltrosAuditoria {
  busca?: string
  acao?: string
  dataInicio?: string
  dataFim?: string
  pagina?: number
  porPagina?: number
}

function aplicarFiltros(
  query: ReturnType<ReturnType<typeof criarClienteSupabaseServidor> extends Promise<infer C> ? never : never> | any,
  filtros?: FiltrosAuditoria,
) {
  let q = query
  // Login/logout não entram na auditoria (volume alto / egress)
  q = q.not('acao', 'in', '("login","logout")')
  if (filtros?.acao) q = q.eq('acao', filtros.acao)
  if (filtros?.busca) {
    q = q.or(`endereco_ip.ilike.%${filtros.busca}%,perfis.email.ilike.%${filtros.busca}%`)
  }
  if (filtros?.dataInicio) {
    q = q.gte('criado_em', `${filtros.dataInicio}T00:00:00.000Z`)
  }
  if (filtros?.dataFim) {
    q = q.lte('criado_em', `${filtros.dataFim}T23:59:59.999Z`)
  }
  return q
}

export async function listarAuditoria(filtros?: FiltrosAuditoria) {
  await exigirAutenticacao(['administrador'])
  const supabase = await criarClienteSupabaseServidor()

  const pagina = filtros?.pagina ?? 1
  const porPagina = filtros?.porPagina ?? 20
  const de = (pagina - 1) * porPagina
  const ate = de + porPagina - 1

  let query = supabase
    .from('auditoria')
    .select('*, perfis(email, nome_completo), empresas(nome_fantasia)', { count: 'exact' })
    .order('criado_em', { ascending: false })

  query = aplicarFiltros(query, filtros).range(de, ate)

  const { data, count, error } = await query
  if (error) {
    console.error('[listarAuditoria]', error.message)
    return { erro: 'Erro ao listar auditoria.', registros: [] as RegistroAuditoria[], total: 0, pagina, porPagina, totalPaginas: 0 }
  }

  return {
    registros: (data ?? []) as RegistroAuditoria[],
    total: count ?? 0,
    pagina,
    porPagina,
    totalPaginas: Math.ceil((count ?? 0) / porPagina),
  }
}

/** Busca todos os registros filtrados para exportação (limite de segurança). */
export async function listarAuditoriaParaExportacao(filtros?: Omit<FiltrosAuditoria, 'pagina' | 'porPagina'>) {
  await exigirAutenticacao(['administrador'])
  const supabase = await criarClienteSupabaseServidor()
  const LIMITE = 5000

  let query = supabase
    .from('auditoria')
    .select('*, perfis(email, nome_completo), empresas(nome_fantasia)')
    .order('criado_em', { ascending: false })
    .limit(LIMITE)

  query = aplicarFiltros(query, filtros)

  const { data, error } = await query
  if (error) {
    console.error('[listarAuditoriaParaExportacao]', error.message)
    return { erro: 'Erro ao exportar auditoria.', registros: [] as RegistroAuditoria[] }
  }

  return { registros: (data ?? []) as RegistroAuditoria[] }
}

/** Últimos eventos para o dashboard admin. */
export async function listarAtividadeRecente(limite = 8) {
  await exigirAutenticacao(['administrador'])
  const supabase = await criarClienteSupabaseServidor()
  const { data } = await supabase
    .from('auditoria')
    .select('id, criado_em, acao, recurso, recurso_id, detalhes, endereco_ip, perfis(nome_completo, email), empresas(nome_fantasia)')
    .not('acao', 'in', '("login","logout")')
    .order('criado_em', { ascending: false })
    .limit(limite)
  return (data ?? []) as unknown as RegistroAuditoria[]
}
