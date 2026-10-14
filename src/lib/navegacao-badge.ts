/** Indica se o href do menu é a rota de mensagens (para badge de não lidas). */
export function ehHrefMensagens(href: string): boolean {
  return href.includes('/mensagens') || href === '/mensagens'
}

export function ehHrefComunicados(href: string): boolean {
  return href.includes('/comunicados') || href === '/comunicados'
}

export function ehHrefDocumentos(href: string): boolean {
  return href.includes('/documentos') || href === '/documentos'
}

export function ehHrefPainel(href: string): boolean {
  return /\/painel\/?$/.test(href) || href.endsWith('/painel')
}

export function ehHrefUsuarios(href: string): boolean {
  return href.includes('/usuarios') || href === '/usuarios'
}

export function ehHrefConfiguracoes(href: string): boolean {
  return href.includes('/configuracoes') || href === '/configuracoes'
}

export function badgeDoHref(
  href: string,
  contadores: {
    mensagens: number
    comunicados: number
    documentosAlerta: number
    convitesPendentes?: number
    retencaoPendente?: number
  },
): number {
  if (ehHrefPainel(href)) {
    return (
      contadores.mensagens +
      contadores.comunicados +
      contadores.documentosAlerta +
      (contadores.convitesPendentes ?? 0) +
      (contadores.retencaoPendente ?? 0)
    )
  }
  if (ehHrefMensagens(href)) return contadores.mensagens
  if (ehHrefComunicados(href)) return contadores.comunicados
  if (ehHrefDocumentos(href)) return contadores.documentosAlerta
  if (ehHrefUsuarios(href)) return contadores.convitesPendentes ?? 0
  if (ehHrefConfiguracoes(href)) return contadores.retencaoPendente ?? 0
  return 0
}
