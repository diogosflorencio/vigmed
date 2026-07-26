import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'

export interface ConsumoArmazenamentoEmpresa {
  empresaId: string
  total: number
  vigmed: number
  empresa: number
}

/** Recalcula armazenamento_usado no banco */
export async function recalcularArmazenamentoEmpresa(empresaId: string) {
  const admin = criarClienteSupabaseAdmin()
  await admin.rpc('recalcular_armazenamento_empresa', { id_empresa: empresaId })
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
