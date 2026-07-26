'use server'

import { revalidatePath } from 'next/cache'
import { criarClienteSupabaseServidor } from '@/lib/supabase/servidor'
import { exigirAutenticacao, registrarAuditoria } from '@/lib/auth/sessao'
import { normalizarEmail, type AmbienteConvite } from '@/lib/auth/convites'
import { enviarEmailConviteAcesso } from '@/lib/auth/email-convite'
import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'
import { ROTAS } from '@/lib/rotas'
import type { PapelUsuario } from '@/types'

interface DadosConvite {
  email: string
  nomeCompleto?: string
  papel: PapelUsuario
  ambiente: AmbienteConvite
  empresaId?: string | null
  observacoes?: string
}

const PAPEIS_ADM: PapelUsuario[] = ['administrador']
const PAPEIS_DOCS: PapelUsuario[] = ['administrador_empresa', 'usuario_empresa']

function validarPapelAmbiente(papel: PapelUsuario, ambiente: AmbienteConvite): string | null {
  if (ambiente === 'adm' && !PAPEIS_ADM.includes(papel)) {
    return 'No painel administrativo, use o papel administrador.'
  }
  if (ambiente === 'docs' && !PAPEIS_DOCS.includes(papel)) {
    return 'No portal docs, use papel administrador_empresa ou usuario_empresa.'
  }
  return null
}

/** Admin cadastra e-mail autorizado - usuário define a senha em /cadastro */
export async function convidarUsuario(dados: DadosConvite) {
  const perfil = await exigirAutenticacao(['administrador', 'administrador_empresa'])

  const email = normalizarEmail(dados.email)
  if (!email.includes('@')) {
    return { erro: 'E-mail inválido.' }
  }

  const erroPapel = validarPapelAmbiente(dados.papel, dados.ambiente)
  if (erroPapel) return { erro: erroPapel }

  const ehAdminEmpresa = perfil.papel === 'administrador_empresa'

  if (ehAdminEmpresa) {
    if (dados.ambiente !== 'docs') {
      return { erro: 'Administradores de empresa só podem convidar para o portal docs.' }
    }
    if (dados.papel !== 'usuario_empresa') {
      return { erro: 'Você só pode convidar usuários com acesso aos documentos da empresa.' }
    }
    if (!perfil.empresa_id) {
      return { erro: 'Sua conta não está vinculada a uma empresa.' }
    }
    if (dados.empresaId && dados.empresaId !== perfil.empresa_id) {
      return { erro: 'Você só pode convidar usuários da sua empresa.' }
    }
  }

  if (dados.ambiente === 'docs' && PAPEIS_DOCS.includes(dados.papel) && !dados.empresaId && !perfil.empresa_id) {
    return { erro: 'Selecione a empresa do convidado.' }
  }

  const supabase = await criarClienteSupabaseServidor()

  const { data: conviteExistente } = await supabase
    .from('convites_acesso')
    .select('id')
    .ilike('email', email)
    .is('usado_em', null)
    .eq('ativo', true)
    .maybeSingle()

  if (conviteExistente) {
    return { erro: 'Já existe um convite pendente para este e-mail.' }
  }

  const empresaId = dados.empresaId ?? (ehAdminEmpresa ? perfil.empresa_id : null)

  const { data: convite, error } = await supabase
    .from('convites_acesso')
    .insert({
      email,
      nome_completo: dados.nomeCompleto?.trim() ?? '',
      papel: dados.papel,
      ambiente: dados.ambiente,
      empresa_id: empresaId,
      convidado_por: perfil.id,
      observacoes: dados.observacoes?.trim() || null,
    })
    .select('id, email, ambiente')
    .single()

  if (error) {
    return { erro: 'Não foi possível criar o convite.' }
  }

  const emailResultado = await enviarEmailConviteAcesso({
    email,
    nomeCompleto: dados.nomeCompleto,
    ambiente: dados.ambiente,
  })

  if (!emailResultado.enviado) {
    const admin = criarClienteSupabaseAdmin()
    await admin.from('convites_acesso').delete().eq('id', convite.id)
    return {
      erro:
        emailResultado.erro ??
        'Convite não foi salvo: falha ao enviar e-mail. Configure SMTP em Supabase → Authentication → Email.',
    }
  }

  await registrarAuditoria({
    acao: 'criacao_usuario',
    usuarioId: perfil.id,
    empresaId: empresaId ?? undefined,
    recurso: 'convites_acesso',
    recursoId: convite.id,
    detalhes: { email, papel: dados.papel, ambiente: dados.ambiente, emailEnviado: emailResultado.tipo },
  })

  revalidatePath(ROTAS.adm.usuarios)
  revalidatePath(ROTAS.docs.usuarios)

  const mensagemEmail =
    emailResultado.tipo === 'convite'
      ? 'E-mail de convite enviado. O usuário deve abrir a mensagem e definir a senha para acessar.'
      : 'E-mail de acesso enviado. O usuário já possui conta e receberá um link para entrar.'

  return {
    sucesso: true,
    mensagem: mensagemEmail,
    convite,
  }
}

/** Lista convites pendentes e usuários (admin global) */
export async function listarConvitesEPerfis() {
  await exigirAutenticacao(['administrador'])

  const supabase = await criarClienteSupabaseServidor()

  const [{ data: convites }, { data: perfis }, { data: empresas }] = await Promise.all([
    supabase
      .from('convites_acesso')
      .select('*, empresas(nome_fantasia)')
      .order('criado_em', { ascending: false })
      .limit(50),
    supabase
      .from('perfis')
      .select('id, email, nome_completo, papel, ativo, ultimo_login_em, empresas(nome_fantasia)')
      .order('criado_em', { ascending: false })
      .limit(50),
    supabase
      .from('empresas')
      .select('id, nome_fantasia')
      .eq('status', 'ativo')
      .order('nome_fantasia'),
  ])

  return { convites: convites ?? [], perfis: perfis ?? [], empresas: empresas ?? [] }
}

/** @deprecated Use listarConvitesEPerfis */
export const listarConvitesEPefis = listarConvitesEPerfis

/** Lista convites e usuários da empresa - portal docs */
export async function listarConvitesEmpresa() {
  const perfil = await exigirAutenticacao(['administrador_empresa'])

  if (!perfil.empresa_id) {
    return { convites: [], perfis: [], empresa: null }
  }

  const supabase = await criarClienteSupabaseServidor()

  const [{ data: convites }, { data: perfis }, { data: empresa }] = await Promise.all([
    supabase
      .from('convites_acesso')
      .select('id, email, nome_completo, papel, usado_em, criado_em')
      .eq('empresa_id', perfil.empresa_id)
      .eq('ambiente', 'docs')
      .order('criado_em', { ascending: false })
      .limit(50),
    supabase
      .from('perfis')
      .select('id, email, nome_completo, papel, ativo, ultimo_login_em')
      .eq('empresa_id', perfil.empresa_id)
      .order('criado_em', { ascending: false })
      .limit(50),
    supabase
      .from('empresas')
      .select('id, nome_fantasia')
      .eq('id', perfil.empresa_id)
      .single(),
  ])

  return {
    convites: convites ?? [],
    perfis: perfis ?? [],
    empresa: empresa ?? null,
  }
}
