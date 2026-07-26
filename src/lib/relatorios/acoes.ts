'use server'

import { exigirAutenticacao } from '@/lib/auth/sessao'
import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'

export interface DadosRelatorios {
  empresasAtivas: number
  usuariosAtivos: number
  documentosAtivos: number
  armazenamentoTotal: number
  contagemStatus: Record<string, number>
  topArmazenamento: {
    nome_fantasia: string
    armazenamento_usado: number
    armazenamento_limite: number
  }[]
}

/** Métricas consolidadas para a página de relatórios */
export async function buscarRelatorios(): Promise<DadosRelatorios> {
  await exigirAutenticacao(['administrador'])
  const supabase = criarClienteSupabaseAdmin()

  const [
    { count: empresasAtivas },
    { count: usuariosAtivos },
    { count: documentosAtivos },
    { data: empresas },
    { data: porStatus },
  ] = await Promise.all([
    supabase.from('empresas').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
    supabase.from('perfis').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('documentos').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('empresas').select('armazenamento_usado, armazenamento_limite, nome_fantasia, status'),
    supabase.from('empresas').select('status'),
  ])

  const armazenamentoTotal = empresas?.reduce((acc, e) => acc + (e.armazenamento_usado ?? 0), 0) ?? 0

  const contagemStatus = (porStatus ?? []).reduce(
    (acc, e) => {
      acc[e.status] = (acc[e.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topArmazenamento = [...(empresas ?? [])]
    .sort((a, b) => b.armazenamento_usado - a.armazenamento_usado)
    .slice(0, 5)

  return {
    empresasAtivas: empresasAtivas ?? 0,
    usuariosAtivos: usuariosAtivos ?? 0,
    documentosAtivos: documentosAtivos ?? 0,
    armazenamentoTotal,
    contagemStatus,
    topArmazenamento,
  }
}
