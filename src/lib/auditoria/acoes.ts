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

export async function listarAuditoria(filtros?: {
  busca?: string
  acao?: string
  pagina?: number
  porPagina?: number
}) {
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
    .range(de, ate)

  if (filtros?.acao) query = query.eq('acao', filtros.acao)
  if (filtros?.busca) {
    query = query.or(`detalhes->>ip.ilike.%${filtros.busca}%,perfis.email.ilike.%${filtros.busca}%`)
  }

  const { data, count, error } = await query
  if (error) {
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
