import { type NextRequest, NextResponse } from 'next/server'
import { atualizarSessao } from '@/lib/supabase/middleware'
import { obterAmbienteDoHost, obterUrlBaseDoAmbiente } from '@/lib/ambiente'
import { ROTAS } from '@/lib/rotas'

const ROTAS_AUTH_UNIFICADAS: string[] = [
  ROTAS.auth.entrar,
  ROTAS.auth.cadastro,
  ROTAS.auth.recuperar,
]

const ROTAS_AUTH_LEGADAS: string[] = [
  '/adm/entrar',
  '/adm/cadastro',
  '/adm/recuperar',
  '/docs/entrar',
  '/docs/cadastro',
  '/docs/recuperar',
]

export async function middleware(requisicao: NextRequest) {
  const { pathname } = requisicao.nextUrl
  const host = requisicao.headers.get('host') ?? 'localhost'
  const ambiente = obterAmbienteDoHost(host)

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return atualizarSessao(requisicao)
  }

  if (ROTAS_AUTH_UNIFICADAS.includes(pathname)) {
    return atualizarSessao(requisicao)
  }

  if (ROTAS_AUTH_LEGADAS.includes(pathname)) {
    const destino = requisicao.nextUrl.clone()
    const mapa: Record<string, string> = {
      '/adm/entrar': ROTAS.auth.entrar,
      '/docs/entrar': ROTAS.auth.entrar,
      '/adm/cadastro': ROTAS.auth.cadastro,
      '/docs/cadastro': ROTAS.auth.cadastro,
      '/adm/recuperar': ROTAS.auth.recuperar,
      '/docs/recuperar': ROTAS.auth.recuperar,
    }
    destino.pathname = mapa[pathname] ?? ROTAS.auth.entrar
    return NextResponse.redirect(destino)
  }

  const url = requisicao.nextUrl.clone()
  const prefixoAmbiente = `/${ambiente}`

  if (!pathname.startsWith(prefixoAmbiente) && ambiente !== 'site') {
    url.pathname = `${prefixoAmbiente}${pathname === '/' ? '' : pathname}`
    const resposta = NextResponse.rewrite(url)
    return await aplicarProtecaoAuth(resposta, requisicao, ambiente, url.pathname)
  }

  if (ambiente === 'site' && !pathname.startsWith('/site') && pathname === '/') {
    url.pathname = '/site'
    return NextResponse.rewrite(url)
  }

  if (ambiente === 'blog' && !pathname.startsWith('/blog')) {
    url.pathname = `/blog${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  return await aplicarProtecaoAuth(
    await atualizarSessao(requisicao),
    requisicao,
    ambiente,
    pathname.startsWith(prefixoAmbiente) ? pathname : url.pathname,
  )
}

async function aplicarProtecaoAuth(
  resposta: NextResponse,
  requisicao: NextRequest,
  ambiente: string,
  caminho: string,
) {
  if (ambiente === 'site' || ambiente === 'blog') return resposta

  const temSessao = requisicao.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'))

  if (!temSessao) {
    const siteBase = obterUrlBaseDoAmbiente('site')
    const loginUrl = new URL(`${siteBase}${ROTAS.auth.entrar}`)
    loginUrl.searchParams.set('redirect', caminho)
    return NextResponse.redirect(loginUrl)
  }

  return resposta
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
