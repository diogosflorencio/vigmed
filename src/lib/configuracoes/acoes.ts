'use server'

import { revalidatePath } from 'next/cache'
import { ROTAS } from '@/lib/rotas'
import { exigirAutenticacao, registrarAuditoria } from '@/lib/auth/sessao'
import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'

export type ConfiguracaoLinha = {
  chave: string
  valor: unknown
  atualizado_em?: string
}

const EXTENSOES_PADRAO = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'zip', 'rar', 'txt', 'csv',
]

/** Lê um valor de configuração (admin client; ignora RLS). */
export async function obterValorConfiguracao<T>(chave: string, padrao: T): Promise<T> {
  const supabase = criarClienteSupabaseAdmin()
  const { data } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', chave)
    .maybeSingle()

  if (data?.valor === undefined || data?.valor === null) return padrao
  return data.valor as T
}

export async function obterLimitePadraoEmpresaBytes(): Promise<number> {
  const valor = await obterValorConfiguracao<{ mb?: number } | number>(
    'armazenamento_limite_padrao_mb',
    { mb: 5120 },
  )
  if (typeof valor === 'number' && valor > 0) {
    // legado: número puro tratado como MB
    return Math.round(valor * 1024 * 1024)
  }
  const mb = typeof valor === 'object' && valor && 'mb' in valor ? Number(valor.mb) : 5120
  return Math.round((Number.isFinite(mb) && mb > 0 ? mb : 5120) * 1024 * 1024)
}

export async function obterTamanhoMaxUploadBytes(): Promise<number> {
  const valor = await obterValorConfiguracao<number | string>('tamanho_max_upload', 104857600)
  const n = typeof valor === 'string' ? Number(valor) : Number(valor)
  return Number.isFinite(n) && n > 0 ? n : 104857600
}

export async function obterExtensoesPermitidas(): Promise<string[]> {
  const valor = await obterValorConfiguracao<string[] | string>('extensoes_permitidas', EXTENSOES_PADRAO)
  if (Array.isArray(valor)) {
    return valor.map((e) => String(e).toLowerCase().replace(/^\./, '')).filter(Boolean)
  }
  if (typeof valor === 'string') {
    try {
      const parsed = JSON.parse(valor) as unknown
      if (Array.isArray(parsed)) {
        return parsed.map((e) => String(e).toLowerCase().replace(/^\./, '')).filter(Boolean)
      }
    } catch {
      return valor.split(/[,\s]+/).map((e) => e.toLowerCase().replace(/^\./, '')).filter(Boolean)
    }
  }
  return EXTENSOES_PADRAO
}

export async function listarConfiguracoes(): Promise<ConfiguracaoLinha[]> {
  await exigirAutenticacao(['administrador'])
  const supabase = criarClienteSupabaseAdmin()
  const { data } = await supabase.from('configuracoes').select('*').order('chave')
  return (data ?? []) as ConfiguracaoLinha[]
}

export async function salvarConfiguracao(chave: string, valor: unknown) {
  await exigirAutenticacao(['administrador'])
  const supabase = criarClienteSupabaseAdmin()

  const { error } = await supabase.from('configuracoes').upsert({
    chave,
    valor: valor as Record<string, unknown> | unknown,
    atualizado_em: new Date().toISOString(),
  })

  if (error) return { erro: 'Não foi possível salvar a configuração.' }

  revalidatePath(ROTAS.adm.configuracoes)
  return { sucesso: true }
}

export type DadosConfiguracoesSistema = {
  limitePadraoMb: number
  tamanhoMaxUploadMb: number
  extensoes: string[]
  diasRetencao: number
  emailComunicadoAutomatico: boolean
}

/** Salva o conjunto de parâmetros globais editáveis no painel. */
export async function salvarConfiguracoesSistema(dados: DadosConfiguracoesSistema) {
  const perfil = await exigirAutenticacao(['administrador'])

  const limiteMb = Math.round(Number(dados.limitePadraoMb))
  const uploadMb = Number(dados.tamanhoMaxUploadMb)
  const dias = Math.round(Number(dados.diasRetencao))

  if (!Number.isFinite(limiteMb) || limiteMb <= 0) {
    return { erro: 'Limite de armazenamento inválido.' }
  }
  if (!Number.isFinite(uploadMb) || uploadMb <= 0) {
    return { erro: 'Tamanho máximo de upload inválido.' }
  }
  if (!Number.isFinite(dias) || dias < 0) {
    return { erro: 'Dias de retenção inválidos.' }
  }

  const extensoes = [...new Set(
    (dados.extensoes ?? [])
      .map((e) => e.trim().toLowerCase().replace(/^\./, ''))
      .filter(Boolean),
  )]

  if (extensoes.length === 0) {
    return { erro: 'Informe ao menos uma extensão permitida.' }
  }

  const supabase = criarClienteSupabaseAdmin()
  const agora = new Date().toISOString()

  const linhas = [
    { chave: 'armazenamento_limite_padrao_mb', valor: { mb: limiteMb }, atualizado_em: agora, atualizado_por: perfil.id },
    { chave: 'tamanho_max_upload', valor: Math.round(uploadMb * 1024 * 1024), atualizado_em: agora, atualizado_por: perfil.id },
    { chave: 'extensoes_permitidas', valor: extensoes, atualizado_em: agora, atualizado_por: perfil.id },
    { chave: 'dias_retencao', valor: dias, atualizado_em: agora, atualizado_por: perfil.id },
    { chave: 'email_comunicado_automatico', valor: Boolean(dados.emailComunicadoAutomatico), atualizado_em: agora, atualizado_por: perfil.id },
  ]

  const { error } = await supabase.from('configuracoes').upsert(linhas)
  if (error) {
    console.error('[salvarConfiguracoesSistema]', error.message)
    return { erro: 'Não foi possível salvar as configurações.' }
  }

  await registrarAuditoria({
    acao: 'atualizacao',
    usuarioId: perfil.id,
    recurso: 'configuracoes',
    detalhes: {
      limitePadraoMb: limiteMb,
      tamanhoMaxUploadMb: uploadMb,
      diasRetencao: dias,
      emailComunicadoAutomatico: dados.emailComunicadoAutomatico,
      extensoes: extensoes.length,
    },
  })

  revalidatePath(ROTAS.adm.configuracoes)
  return { sucesso: true }
}

/** Simula retenção sem excluir (admin). */
export async function simularRetencaoConfiguracao() {
  await exigirAutenticacao(['administrador'])
  const { simularRetencaoDocumentos } = await import('@/lib/documentos/retencao')
  return simularRetencaoDocumentos()
}

/** Envia e-mail de teste para validar Resend (admin). */
export async function enviarEmailTeste(emailDestino: string) {
  const perfil = await exigirAutenticacao(['administrador'])
  const email = emailDestino.trim().toLowerCase()
  if (!email.includes('@')) return { erro: 'Informe um e-mail válido.' }

  const { enviarEmail } = await import('@/lib/email/enviar')
  const resultado = await enviarEmail({
    para: email,
    assunto: '[VIGMED] E-mail de teste',
    html: `
      <p style="font-family:system-ui,sans-serif">Configuração de e-mail OK.</p>
      <p style="font-family:system-ui,sans-serif;color:#555">Enviado por ${perfil.email} em ${new Date().toLocaleString('pt-BR')}.</p>
    `,
    texto: 'Configuração de e-mail VIGMED OK.',
  })

  if (!resultado.enviado) {
    return { erro: resultado.motivo ?? 'Falha ao enviar e-mail de teste.' }
  }
  return { sucesso: true }
}

/** Executa exclusão por retenção manualmente (admin). */
export async function executarRetencaoDocumentos() {
  const perfil = await exigirAutenticacao(['administrador'])
  const { aplicarRetencaoDocumentos } = await import('@/lib/documentos/retencao')
  const resultado = await aplicarRetencaoDocumentos()

  await registrarAuditoria({
    acao: 'atualizacao',
    usuarioId: perfil.id,
    recurso: 'configuracoes',
    detalhes: { acao: 'retencao_documentos', ...resultado },
  })

  revalidatePath(ROTAS.adm.documentos)
  revalidatePath(ROTAS.docs.documentos)
  return { sucesso: true, ...resultado }
}
