export type AmbienteApp = 'site' | 'adm' | 'docs' | 'blog'

/**
 * Funções usadas no proxy (Edge). Sem Zod — evita falha de bundle no runtime.
 */
export function obterAmbienteDoHost(hostname: string): AmbienteApp {
  const dominioRaiz = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vigmed.com.br'
  const host = hostname.split(':')[0]

  if (host === 'localhost' || host === '127.0.0.1') {
    return (process.env.VIGMED_DEV_TENANT as AmbienteApp) ?? 'site'
  }

  if (host === dominioRaiz || host === `www.${dominioRaiz}`) return 'site'
  if (host === `adm.${dominioRaiz}`) return 'adm'
  if (host === `docs.${dominioRaiz}`) return 'docs'
  if (host === `blog.${dominioRaiz}`) return 'blog'

  const partes = host.split('.')
  if (partes.length >= 3) {
    const subdominio = partes[0]
    if (subdominio === 'adm') return 'adm'
    if (subdominio === 'docs') return 'docs'
    if (subdominio === 'blog') return 'blog'
  }

  return 'site'
}

export function obterUrlBaseDoAmbiente(ambiente: AmbienteApp): string {
  const dominioRaiz = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vigmed.com.br'
  const emDesenvolvimento = process.env.NODE_ENV === 'development'

  if (emDesenvolvimento) {
    const porta = process.env.PORT ?? '3000'
    return `http://localhost:${porta}`
  }

  switch (ambiente) {
    case 'adm':
      return process.env.NEXT_PUBLIC_ADMIN_URL ?? `https://adm.${dominioRaiz}`
    case 'docs':
      return process.env.NEXT_PUBLIC_DOCS_URL ?? `https://docs.${dominioRaiz}`
    case 'blog':
      return process.env.NEXT_PUBLIC_BLOG_URL ?? `https://blog.${dominioRaiz}`
    default:
      return process.env.NEXT_PUBLIC_SITE_URL ?? `https://${dominioRaiz}`
  }
}
