/** Indica se o href do menu é a rota de mensagens (para badge de não lidas). */
export function ehHrefMensagens(href: string): boolean {
  return href.includes('/mensagens') || href === '/mensagens'
}
