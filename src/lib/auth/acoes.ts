'use server'

import { redirect } from 'next/navigation'
import { criarClienteSupabaseServidor } from '@/lib/supabase/servidor'
import { registrarAuditoria, exigirAutenticacao } from '@/lib/auth/sessao'
import { normalizarEmail, validarConviteParaCadastro } from '@/lib/auth/convites'
import { validarPerfilAposAutenticacao } from '@/lib/auth/perfil-servidor'
import { urlBaseAuthDaRequisicao, urlPainelAposLogin, resolverDestinoPosLogin } from '@/lib/auth/redirecionamento'
import { ROTAS } from '@/lib/rotas'

/** Login com e-mail e senha; redireciona ao painel conforme o papel */
export async function entrarComEmail(
  email: string,
  senha: string,
  opcoes?: { redirect?: string; ambiente?: string },
) {
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
  redirect(
    resolverDestinoPosLogin(validacao.perfil.papel, urlBase, opcoes?.redirect, opcoes?.ambiente),
  )
}

/** Cadastro com convite pré-autorizado; cria conta confirmada e já autentica */
export async function cadastrarComEmail(
  email: string,
  senha: string,
  nomeCompleto: string,
) {
  const emailNormalizado = normalizarEmail(email)

  const convite = await validarConviteParaCadastro(emailNormalizado)
  if (!convite.valido) return { erro: convite.erro }

  const { criarClienteSupabaseAdmin } = await import('@/lib/supabase/admin')
  const admin = criarClienteSupabaseAdmin()

  const { data: criado, error: erroCriacao } = await admin.auth.admin.createUser({
    email: emailNormalizado,
    password: senha,
    email_confirm: true,
    user_metadata: { nome_completo: nomeCompleto.trim() },
  })

  if (erroCriacao) {
    const msg = erroCriacao.message.toLowerCase()
    if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
      return { erro: 'Este e-mail já possui conta. Faça login em /entrar.' }
    }
    return { erro: erroCriacao.message }
  }

  if (!criado.user) {
    return { erro: 'Não foi possível criar a conta.' }
  }

  const supabase = await criarClienteSupabaseServidor()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailNormalizado,
    password: senha,
  })

  if (error || !data.user) {
    return { erro: 'Conta criada, mas não foi possível entrar automaticamente. Faça login.' }
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
    acao: 'criacao',
    usuarioId: data.user.id,
    detalhes: { metodo: 'email', ambiente: convite.convite.ambiente },
  })

  await registrarAuditoria({
    acao: 'login',
    usuarioId: data.user.id,
    detalhes: { metodo: 'email', origem: 'cadastro' },
  })

  const urlBase = await urlBaseAuthDaRequisicao()
  redirect(urlPainelAposLogin(validacao.perfil.papel, urlBase))
}

export async function entrarComGoogle() {
  return {
    erro: 'Use o botão Continuar com Google na página de login.',
  }
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

/** Define nova senha após link de recuperação ou troca voluntária no perfil */
export async function redefinirSenha(novaSenha: string, confirmarSenha: string) {
  const perfil = await exigirAutenticacao()

  if (novaSenha.length < 8) {
    return { erro: 'Use pelo menos 8 caracteres.' }
  }

  if (novaSenha !== confirmarSenha) {
    return { erro: 'As senhas não coincidem.' }
  }

  const supabase = await criarClienteSupabaseServidor()
  const { error } = await supabase.auth.updateUser({ password: novaSenha })

  if (error) {
    return { erro: 'Não foi possível alterar a senha. Solicite um novo link de recuperação.' }
  }

  await registrarAuditoria({
    acao: 'atualizacao',
    usuarioId: perfil.id,
    detalhes: { tipo: 'senha' },
  })

  return { sucesso: true }
}
