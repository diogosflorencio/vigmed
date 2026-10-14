import { unstable_cache } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache/tags'
import { contarMensagensNaoLidas } from '@/lib/mensagens/acoes'
import { listarAlertasValidadeDocumentos } from '@/lib/documentos/acoes'
import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'
import type { NotificacoesPortalState } from '@/contexts/NotificacoesPortalContext'

/** Retenção é cara e não depende de cookies do request. */
export async function obterRetencaoPendenteCached(): Promise<number> {
  return unstable_cache(
    async () => {
      const { simularRetencaoDocumentos } = await import('@/lib/documentos/retencao')
      const { candidatos } = await simularRetencaoDocumentos()
      return candidatos
    },
    ['retencao-pendente-v1'],
    { revalidate: 300, tags: [CACHE_TAGS.retencao] },
  )()
}

const convitesCached = unstable_cache(
  async () => {
    const supabase = criarClienteSupabaseAdmin()
    const { count } = await supabase
      .from('convites_acesso')
      .select('*', { count: 'exact', head: true })
      .is('usado_em', null)
    return count ?? 0
  },
  ['convites-pendentes-v1'],
  { revalidate: 60, tags: [CACHE_TAGS.notifPainel] },
)

/**
 * Contagens do shell.
 * Funções que usam sessão/cookies ficam fora do unstable_cache.
 */
export async function obterNotificacoesPainelCached(
  ambiente: 'adm' | 'docs',
  _perfilId: string,
): Promise<NotificacoesPortalState> {
  const [{ total }, alertas] = await Promise.all([
    contarMensagensNaoLidas(),
    listarAlertasValidadeDocumentos(100),
  ])
  const documentosAlerta = alertas.length

  if (ambiente === 'docs') {
    const { listarComunicadosEmpresa } = await import('@/lib/comunicados/acoes')
    const { naoLidos } = await listarComunicadosEmpresa()
    return {
      mensagens: total,
      comunicados: naoLidos,
      documentosAlerta,
      convitesPendentes: 0,
      retencaoPendente: 0,
    }
  }

  const [convitesPendentes, retencaoPendente] = await Promise.all([
    convitesCached(),
    obterRetencaoPendenteCached(),
  ])

  return {
    mensagens: total,
    comunicados: 0,
    documentosAlerta,
    convitesPendentes,
    retencaoPendente,
  }
}
