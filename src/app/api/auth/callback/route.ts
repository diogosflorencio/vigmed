import { NextResponse } from 'next/server'
import { criarClienteSupabaseServidor } from '@/lib/supabase/servidor'
import { registrarAuditoria } from '@/lib/auth/sessao'
import { validarPerfilAposAutenticacao } from '@/lib/auth/perfil-servidor'
import {
  ambienteDoPapel,
  urlPainelNaOrigem,
} from '@/lib/auth/redirecionamento'
import { ROTAS } from '@/lib/rotas'

/** Callback OAuth (Google) e redefinição de senha; redireciona pelo papel */
export async function GET(requisicao: Request) {
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

    const supabase = await criarClienteSupabaseServidor()
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
      return NextResponse.redirect(`${urlAuth}${ROTAS.auth.entrar}?erro=sem_acesso`)
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

    return NextResponse.redirect(destino)
  } catch (erro) {
    console.error('[auth/callback] Erro não tratado:', erro)
    return NextResponse.redirect(`${urlAuth}${ROTAS.auth.entrar}?erro=auth`)
  }
}
