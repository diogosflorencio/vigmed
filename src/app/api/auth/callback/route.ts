import { NextResponse } from 'next/server'
import { criarClienteSupabaseServidor } from '@/lib/supabase/servidor'
import { registrarAuditoria } from '@/lib/auth/sessao'
import { validarPerfilAposAutenticacao } from '@/lib/auth/perfil-servidor'
import { ambienteDoPapel, urlBaseAuth, urlPainelPorPapel } from '@/lib/auth/redirecionamento'
import { obterUrlBaseDoAmbiente } from '@/lib/ambiente'
import { ROTAS } from '@/lib/rotas'

/** Callback OAuth (Google) e redefinição de senha; redireciona pelo papel */
export async function GET(requisicao: Request) {
  const { searchParams } = new URL(requisicao.url)
  const codigo = searchParams.get('code')
  const tipo = searchParams.get('tipo')
  const urlAuth = urlBaseAuth()

  if (!codigo) {
    return NextResponse.redirect(`${urlAuth}${ROTAS.auth.entrar}?erro=auth`)
  }

  const supabase = await criarClienteSupabaseServidor()
  const { data, error } = await supabase.auth.exchangeCodeForSession(codigo)

  if (error || !data.user) {
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
  const urlBase = obterUrlBaseDoAmbiente(ambiente)

  const destino =
    tipo === 'redefinir'
      ? `${urlBase}/${ambiente}/perfil?redefinir=1`
      : urlPainelPorPapel(perfil.papel)

  return NextResponse.redirect(destino)
}
