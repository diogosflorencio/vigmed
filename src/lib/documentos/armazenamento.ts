import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'

export interface ConsumoArmazenamentoEmpresa {
  empresaId: string
  total: number
  vigmed: number
  empresa: number
}

export interface TotaisArmazenamentoPlataforma {
  /** Arquivos enviados pelo admin (origem admin) — sem limite */
  vigmed: number
  /** Arquivos enviados pelas empresas — contam na cota */
  empresa: number
  /** Soma única de todos os documentos ativos */
  total: number
  /** Soma dos limites configurados por empresa */
  limiteEmpresas: number
}

/** Recalcula armazenamento_usado no banco */
export async function recalcularArmazenamentoEmpresa(empresaId: string) {
  const admin = criarClienteSupabaseAdmin()
  await admin.rpc('recalcular_armazenamento_empresa', { id_empresa: empresaId })
}

/** Totais globais (cada documento conta uma vez, sem duplicar multi-empresa) */
export async function obterTotaisArmazenamento(): Promise<TotaisArmazenamentoPlataforma> {
  const admin = criarClienteSupabaseAdmin()

  const [{ data: documentos }, { data: empresas }] = await Promise.all([
    admin.from('documentos').select('tamanho_arquivo, origem_publicacao').eq('ativo', true),
    admin.from('empresas').select('armazenamento_limite'),
  ])

  let vigmed = 0
  let empresa = 0
  for (const doc of documentos ?? []) {
    const tamanho = doc.tamanho_arquivo ?? 0
    if (doc.origem_publicacao === 'empresa') empresa += tamanho
    else vigmed += tamanho
  }

  const limiteEmpresas = empresas?.reduce((acc, e) => acc + (e.armazenamento_limite ?? 0), 0) ?? 0

  return { vigmed, empresa, total: vigmed + empresa, limiteEmpresas }
}

/** Consumo de origem empresa para validar cota no upload */
export async function obterConsumoCotaEmpresa(empresaId: string): Promise<number> {
  const mapa = await obterConsumoPorEmpresas([empresaId])
  return mapa.get(empresaId)?.empresa ?? 0
}

/** Consumo por empresa: arquivos VIGMED (admin) vs enviados pela empresa */
export async function obterConsumoPorEmpresas(
  empresaIds?: string[],
): Promise<Map<string, ConsumoArmazenamentoEmpresa>> {
  const admin = criarClienteSupabaseAdmin()

  let query = admin
    .from('documento_empresas')
    .select('empresa_id, documentos!inner(tamanho_arquivo, origem_publicacao, ativo)')
    .eq('documentos.ativo', true)

  if (empresaIds?.length) {
    query = query.in('empresa_id', empresaIds)
  }

  const { data } = await query
  const mapa = new Map<string, ConsumoArmazenamentoEmpresa>()

  for (const row of data ?? []) {
    const empresaId = row.empresa_id as string
    const docRaw = row.documentos
    const doc = (Array.isArray(docRaw) ? docRaw[0] : docRaw) as {
      tamanho_arquivo: number
      origem_publicacao: string
    } | null
    if (!doc) continue
    const tamanho = doc.tamanho_arquivo ?? 0
    const atual = mapa.get(empresaId) ?? { empresaId, total: 0, vigmed: 0, empresa: 0 }
    atual.total += tamanho
    if (doc.origem_publicacao === 'empresa') atual.empresa += tamanho
    else atual.vigmed += tamanho
    mapa.set(empresaId, atual)
  }

  return mapa
}
