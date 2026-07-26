import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { registrarAuditoria } from '@/lib/auth/sessao'
import { validarPerfilAposAutenticacao } from '@/lib/auth/perfil-servidor'
import {
  ambienteDoPapel,
  urlPainelNaOrigem,
} from '@/lib/auth/redirecionamento'
import { ROTAS } from '@/lib/rotas'

/** Copia cookies de sessão (PKCE) para o redirect final */
function redirecionarComCookies(respostaOrigem: NextResponse, url: string) {
  const destino = NextResponse.redirect(url)
  respostaOrigem.cookies.getAll().forEach((cookie) => {
    destino.cookies.set(cookie)
  })
  return destino
}

function criarSupabaseCallback(requisicao: NextRequest) {
  let respostaComCookies = NextResponse.next({ request: requisicao })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return requisicao.cookies.getAll()
        },
        setAll(cookiesParaDefinir: { name: string; value: string; options: CookieOptions }[]) {
          cookiesParaDefinir.forEach(({ name, value }) => requisicao.cookies.set(name, value))
          respostaComCookies = NextResponse.next({ request: requisicao })
          cookiesParaDefinir.forEach(({ name, value, options }) =>
            respostaComCookies.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  return {
    supabase,
    obterRespostaComCookies: () => respostaComCookies,
  }
}

/** Callback OAuth (Google) e redefinição de senha; redireciona pelo papel */
export async function GET(requisicao: NextRequest) {
  const origem = new URL(requisicao.url)
  const urlAuth = `${origem.protocol}//${origem.host}`
  const { searchParams } = origem
  const codigo = searchParams.get('code')
  const tipo = searchParams.get('tipo')
  const oauthErro = searchParams.get('error')
  const oauthDescricao = searchParams.get('error_description')

  try {
    if (oauthErro) {
      console.error('[auth/callback] OAuth:', oauthErro, oauthDescricao)
      const msg = encodeURIComponent(oauthDescricao ?? oauthErro)
      return NextResponse.redirect(`${urlAuth}${ROTAS.auth.entrar}?erro=oauth&msg=${msg}`)
    }

    if (!codigo) {
      return NextResponse.redirect(`${urlAuth}${ROTAS.auth.entrar}?erro=auth`)
    }

    const { supabase, obterRespostaComCookies } = criarSupabaseCallback(requisicao)
    const { data, error } = await supabase.auth.exchangeCodeForSession(codigo)

    if (error || !data.user) {
      console.error('[auth/callback] Sessão inválida:', error?.message)
      return NextResponse.redirect(`${urlAuth}${ROTAS.auth.entrar}?erro=auth`)
    }

    const validacao = await validarPerfilAposAutenticacao(
      data.user.id,
      data.user.email ?? '',
    )

    if ('erro' in validacao) {
      await supabase.auth.signOut()
      return redirecionarComCookies(
        obterRespostaComCookies(),
        `${urlAuth}${ROTAS.auth.entrar}?erro=sem_acesso`,
      )
    }

    const { perfil } = validacao

    await supabase
      .from('perfis')
      .update({ ultimo_login_em: new Date().toISOString() })
      .eq('id', data.user.id)

    await registrarAuditoria({
      acao: 'login',
      usuarioId: data.user.id,
      detalhes: { metodo: 'google', email: data.user.email },
    })

    const ambiente = ambienteDoPapel(perfil.papel)

    const destino =
      tipo === 'redefinir'
        ? `${urlAuth}/${ambiente}/perfil?redefinir=1`
        : urlPainelNaOrigem(perfil.papel, urlAuth)

    return redirecionarComCookies(obterRespostaComCookies(), destino)
  } catch (erro) {
    console.error('[auth/callback] Erro não tratado:', erro)
    return NextResponse.redirect(`${urlAuth}${ROTAS.auth.entrar}?erro=auth`)
  }
}
