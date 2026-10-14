'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { atualizarNotificacoesPainel } from '@/lib/painel/notificacoes-client'

export interface NotificacoesPortalState {
  mensagens: number
  comunicados: number
  documentosAlerta: number
  convitesPendentes: number
  retencaoPendente: number
}

interface ContextoNotificacoesPortal extends NotificacoesPortalState {
  definirMensagens: (n: number) => void
  definirComunicados: (n: number) => void
  definirDocumentosAlerta: (n: number) => void
  atualizar: () => Promise<void>
}

const Contexto = createContext<ContextoNotificacoesPortal | null>(null)

/** Sem poll agressivo: só refresca ao voltar à aba, no máximo a cada 5 min. */
const MIN_INTERVALO_MS = 5 * 60 * 1000

export function ProvedorNotificacoesPortal({
  inicial,
  ambiente,
  children,
}: {
  inicial: NotificacoesPortalState
  ambiente: 'adm' | 'docs'
  children: ReactNode
}) {
  const [mensagens, definirMensagens] = useState(inicial.mensagens)
  const [comunicados, definirComunicados] = useState(inicial.comunicados)
  const [documentosAlerta, definirDocumentosAlerta] = useState(inicial.documentosAlerta)
  const [convitesPendentes, definirConvitesPendentes] = useState(inicial.convitesPendentes)
  const [retencaoPendente, definirRetencaoPendente] = useState(inicial.retencaoPendente)
  const ultimoRefresh = useRef(0)
  const emVoo = useRef(false)

  useEffect(() => {
    definirMensagens(inicial.mensagens)
    definirComunicados(inicial.comunicados)
    definirDocumentosAlerta(inicial.documentosAlerta)
    definirConvitesPendentes(inicial.convitesPendentes)
    definirRetencaoPendente(inicial.retencaoPendente)
    ultimoRefresh.current = Date.now()
  }, [
    inicial.mensagens,
    inicial.comunicados,
    inicial.documentosAlerta,
    inicial.convitesPendentes,
    inicial.retencaoPendente,
  ])

  const aplicar = useCallback((n: NotificacoesPortalState) => {
    definirMensagens(n.mensagens)
    definirComunicados(n.comunicados)
    definirDocumentosAlerta(n.documentosAlerta)
    definirConvitesPendentes(n.convitesPendentes)
    definirRetencaoPendente(n.retencaoPendente)
    ultimoRefresh.current = Date.now()
  }, [])

  const atualizar = useCallback(async () => {
    if (emVoo.current) return
    emVoo.current = true
    try {
      const n = await atualizarNotificacoesPainel(ambiente)
      aplicar(n)
    } finally {
      emVoo.current = false
    }
  }, [ambiente, aplicar])

  useEffect(() => {
    function aoVisibilidade() {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - ultimoRefresh.current < MIN_INTERVALO_MS) return
      void atualizar()
    }
    document.addEventListener('visibilitychange', aoVisibilidade)
    return () => document.removeEventListener('visibilitychange', aoVisibilidade)
  }, [atualizar])

  const valor = useMemo(
    () => ({
      mensagens,
      comunicados,
      documentosAlerta,
      convitesPendentes,
      retencaoPendente,
      definirMensagens,
      definirComunicados,
      definirDocumentosAlerta,
      atualizar,
    }),
    [mensagens, comunicados, documentosAlerta, convitesPendentes, retencaoPendente, atualizar],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useNotificacoesPortal() {
  const ctx = useContext(Contexto)
  if (!ctx) {
    return {
      mensagens: 0,
      comunicados: 0,
      documentosAlerta: 0,
      convitesPendentes: 0,
      retencaoPendente: 0,
      definirMensagens: (_n: number) => {},
      definirComunicados: (_n: number) => {},
      definirDocumentosAlerta: (_n: number) => {},
      atualizar: async () => {},
    }
  }
  return ctx
}

/** Compatível com código que só usa mensagens não lidas. */
export function useMensagensNaoLidas() {
  const n = useNotificacoesPortal()
  return {
    total: n.mensagens,
    definirTotal: n.definirMensagens,
    atualizar: n.atualizar,
  }
}
