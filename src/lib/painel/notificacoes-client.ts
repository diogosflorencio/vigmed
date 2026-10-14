'use server'

import { obterNotificacoesPainelCached } from '@/lib/painel/notificacoes-cache'
import { obterPerfilAtual } from '@/lib/auth/sessao'
import type { NotificacoesPortalState } from '@/contexts/NotificacoesPortalContext'

/** Uma única server action para refrescar badges (evita 4 POSTs / egress). */
export async function atualizarNotificacoesPainel(
  ambiente: 'adm' | 'docs',
): Promise<NotificacoesPortalState> {
  const perfil = await obterPerfilAtual()
  if (!perfil) {
    return {
      mensagens: 0,
      comunicados: 0,
      documentosAlerta: 0,
      convitesPendentes: 0,
      retencaoPendente: 0,
    }
  }
  return obterNotificacoesPainelCached(ambiente, perfil.id)
}
