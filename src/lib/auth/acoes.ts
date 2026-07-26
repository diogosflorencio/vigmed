'use server'

import { redirect } from 'next/navigation'
import { criarClienteSupabaseServidor } from '@/lib/supabase/servidor'
import { registrarAuditoria } from '@/lib/auth/sessao'
import { normalizarEmail, validarConviteParaCadastro } from '@/lib/auth/convites'
import { validarPerfilAposAutenticacao } from '@/lib/auth/perfil-servidor'
import { urlBaseAuthDaRequisicao, urlPainelNaOrigem } from '@/lib/auth/redirecionamento'
import { ROTAS } from '@/lib/rotas'

/** Login com e-mail e senha; redireciona ao painel conforme o papel */
export async function entrarComEmail(email: string, senha: string) {
  const supabase = await criarClienteSupabaseServidor()
  const emailNormalizado = normalizarEmail(email)

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailNormalizado,
    password: senha,
  })

  if (error) {
    return { erro: 'E-mail ou senha incorretos.' }
  }

  const validacao = await validarPerfilAposAutenticacao(
    data.user.id,
    data.user.email ?? emailNormalizado,
  )

  if ('erro' in validacao) {
    await supabase.auth.signOut()
    return { erro: validacao.erro }
  }

  await supabase
    .from('perfis')
    .update({ ultimo_login_em: new Date().toISOString() })
    .eq('id', data.user.id)

  await registrarAuditoria({
    acao: 'login',
    usuarioId: data.user.id,
    detalhes: { metodo: 'email' },
  })

  const urlBase = await urlBaseAuthDaRequisicao()
  redirect(urlPainelNaOrigem(validacao.perfil.papel, urlBase))
}

/** Cadastro com convite pré-autorizado */
export async function cadastrarComEmail(
  email: string,
  senha: string,
  nomeCompleto: string,
) {
  const emailNormalizado = normalizarEmail(email)

  const convite = await validarConviteParaCadastro(emailNormalizado)
  if (!convite.valido) return { erro: convite.erro }

  const supabase = await criarClienteSupabaseServidor()

  const { data, error } = await supabase.auth.signUp({
    email: emailNormalizado,
    password: senha,
    options: {
      data: { nome_completo: nomeCompleto.trim() },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { erro: 'Este e-mail já possui conta. Entre com senha, Google ou o link enviado por e-mail.' }
    }
    return { erro: error.message }
  }

  if (!data.user) {
    return { erro: 'Não foi possível criar a conta.' }
  }

  await registrarAuditoria({
    acao: 'criacao',
    usuarioId: data.user.id,
    detalhes: { metodo: 'email', ambiente: convite.convite.ambiente },
  })

  return {
    sucesso: true,
    mensagem: 'Conta criada! Se a confirmação por e-mail estiver ativa, verifique sua caixa de entrada. Depois, faça login.',
  }
}

export async function entrarComGoogle() {
  const supabase = await criarClienteSupabaseServidor()
  const urlBase = await urlBaseAuthDaRequisicao()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${urlBase}/api/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error || !data.url) {
    return { erro: 'Não foi possível iniciar login com Google.' }
  }

  redirect(data.url)
}

export async function sair() {
  const supabase = await criarClienteSupabaseServidor()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await registrarAuditoria({
      acao: 'logout',
      usuarioId: user.id,
    })
  }

  await supabase.auth.signOut()
  redirect(ROTAS.auth.entrar)
}

export async function solicitarRedefinicaoSenha(email: string) {
  const supabase = await criarClienteSupabaseServidor()
  const urlBase = await urlBaseAuthDaRequisicao()
  const emailNormalizado = normalizarEmail(email)

  const { error } = await supabase.auth.resetPasswordForEmail(emailNormalizado, {
    redirectTo: `${urlBase}/api/auth/callback?tipo=redefinir`,
  })

  if (error) {
    return { erro: 'Não foi possível enviar o e-mail de redefinição.' }
  }

  return { sucesso: true, mensagem: 'Se o e-mail estiver cadastrado, você receberá as instruções.' }
}
