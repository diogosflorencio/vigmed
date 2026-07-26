'use server'

import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'
import { criarClienteSupabaseServidor } from '@/lib/supabase/servidor'
import { obterPerfilAtual } from '@/lib/auth/sessao'
import { listarComunicadosEmpresa } from '@/lib/comunicados/acoes'
import { listarDocumentosRecentes } from '@/lib/documentos/acoes'
import { listarConversas } from '@/lib/mensagens/acoes'
import type { EstatisticasPainelAdmin, IndicadoresPainel } from '@/types'

const SETE_DIAS_MS = 7 * 86400000
const TRINTA_DIAS_MS = 30 * 86400000
const VINTE_QUATRO_H_MS = 86400000

function desde(ms: number) {
  return new Date(Date.now() - ms).toISOString()
}

/** Estatísticas amplas do painel administrativo */
export async function buscarEstatisticasPainelAdmin(): Promise<EstatisticasPainelAdmin> {
  const supabase = criarClienteSupabaseAdmin()
  const desde7d = desde(SETE_DIAS_MS)
  const desde30d = desde(TRINTA_DIAS_MS)
  const desde24h = desde(VINTE_QUATRO_H_MS)

  const [
    { count: empresasAtivas },
    { count: empresasInativas },
    { count: empresasSuspensas },
    { data: empresasArmazenamento },
    { data: maiorEmpresa },
    { count: usuariosAtivos },
    { count: usuariosInativos },
    { count: administradores },
    { count: administradoresEmpresa },
    { count: usuariosEmpresa },
    { count: loginsRecentes },
    { count: documentosTotal },
    { count: documentosAtivos },
    { count: documentosCriados7d },
    { count: documentosCriados30d },
    { data: documentosMetricas },
    { count: categorias },
    { count: comunicadosTotal },
    { count: comunicadosAtivos },
    { count: comunicadosFixados },
    { count: comunicadoLeituras },
    { count: conversasAtivas },
    { count: totalMensagens },
    { count: mensagens7d },
    { count: blogPublicados },
    { count: blogRascunhos },
    { count: blogArquivados },
    { count: blogVisualizacoes7d },
    { count: convitesPendentes },
    { count: convitesAceitos30d },
    { count: auditoria7d },
    { count: auditoria24h },
    { count: logins7d },
    { count: envios7d },
    { count: downloads7d },
  ] = await Promise.all([
    supabase.from('empresas').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
    supabase.from('empresas').select('*', { count: 'exact', head: true }).eq('status', 'inativo'),
    supabase.from('empresas').select('*', { count: 'exact', head: true }).eq('status', 'suspenso'),
    supabase.from('empresas').select('armazenamento_usado, armazenamento_limite'),
    supabase.from('empresas').select('nome_fantasia, armazenamento_usado').order('armazenamento_usado', { ascending: false }).limit(1),
    supabase.from('perfis').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('perfis').select('*', { count: 'exact', head: true }).eq('ativo', false),
    supabase.from('perfis').select('*', { count: 'exact', head: true }).eq('papel', 'administrador').eq('ativo', true),
    supabase.from('perfis').select('*', { count: 'exact', head: true }).eq('papel', 'administrador_empresa').eq('ativo', true),
    supabase.from('perfis').select('*', { count: 'exact', head: true }).eq('papel', 'usuario_empresa').eq('ativo', true),
    supabase.from('perfis').select('*', { count: 'exact', head: true }).gte('ultimo_login_em', desde7d),
    supabase.from('documentos').select('*', { count: 'exact', head: true }),
    supabase.from('documentos').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('documentos').select('*', { count: 'exact', head: true }).gte('criado_em', desde7d),
    supabase.from('documentos').select('*', { count: 'exact', head: true }).gte('criado_em', desde30d),
    supabase.from('documentos').select('tamanho_arquivo, total_downloads').eq('ativo', true),
    supabase.from('categorias').select('*', { count: 'exact', head: true }),
    supabase.from('comunicados').select('*', { count: 'exact', head: true }),
    supabase.from('comunicados').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('comunicados').select('*', { count: 'exact', head: true }).eq('fixado', true).eq('ativo', true),
    supabase.from('comunicado_leituras').select('*', { count: 'exact', head: true }),
    supabase.from('conversas').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('mensagens').select('*', { count: 'exact', head: true }),
    supabase.from('mensagens').select('*', { count: 'exact', head: true }).gte('criado_em', desde7d),
    supabase.from('posts_blog').select('*', { count: 'exact', head: true }).eq('status', 'publicado'),
    supabase.from('posts_blog').select('*', { count: 'exact', head: true }).eq('status', 'rascunho'),
    supabase.from('posts_blog').select('*', { count: 'exact', head: true }).eq('status', 'arquivado'),
    supabase.from('blog_visualizacoes').select('*', { count: 'exact', head: true }).gte('visualizado_em', desde7d),
    supabase.from('convites_acesso').select('*', { count: 'exact', head: true }).is('usado_em', null),
    supabase.from('convites_acesso').select('*', { count: 'exact', head: true }).gte('usado_em', desde30d),
    supabase.from('auditoria').select('*', { count: 'exact', head: true }).gte('criado_em', desde7d),
    supabase.from('auditoria').select('*', { count: 'exact', head: true }).gte('criado_em', desde24h),
    supabase.from('auditoria').select('*', { count: 'exact', head: true }).eq('acao', 'login').gte('criado_em', desde7d),
    supabase.from('auditoria').select('*', { count: 'exact', head: true }).eq('acao', 'envio').gte('criado_em', desde7d),
    supabase.from('auditoria').select('*', { count: 'exact', head: true }).eq('acao', 'download').gte('criado_em', desde7d),
  ])

  const armazenamentoUsado = empresasArmazenamento?.reduce((acc, e) => acc + (e.armazenamento_usado ?? 0), 0) ?? 0
  const armazenamentoLimite = empresasArmazenamento?.reduce((acc, e) => acc + (e.armazenamento_limite ?? 0), 0) ?? 0
  const totalEmpresas = (empresasAtivas ?? 0) + (empresasInativas ?? 0) + (empresasSuspensas ?? 0)
  const somaTamanho = documentosMetricas?.reduce((acc, d) => acc + (d.tamanho_arquivo ?? 0), 0) ?? 0
  const somaDownloads = documentosMetricas?.reduce((acc, d) => acc + (d.total_downloads ?? 0), 0) ?? 0
  const top = maiorEmpresa?.[0]

  return {
    empresas: {
      ativas: empresasAtivas ?? 0,
      inativas: empresasInativas ?? 0,
      suspensas: empresasSuspensas ?? 0,
      total: totalEmpresas,
      armazenamentoUsado,
      armazenamentoLimite,
      mediaArmazenamento: totalEmpresas > 0 ? Math.round(armazenamentoUsado / totalEmpresas) : 0,
      maiorConsumo: top
        ? { nome: top.nome_fantasia, bytes: top.armazenamento_usado ?? 0 }
        : null,
    },
    usuarios: {
      ativos: usuariosAtivos ?? 0,
      inativos: usuariosInativos ?? 0,
      administradores: administradores ?? 0,
      administradoresEmpresa: administradoresEmpresa ?? 0,
      usuariosEmpresa: usuariosEmpresa ?? 0,
      loginsRecentes: loginsRecentes ?? 0,
    },
    documentos: {
      total: documentosTotal ?? 0,
      ativos: documentosAtivos ?? 0,
      criados7d: documentosCriados7d ?? 0,
      criados30d: documentosCriados30d ?? 0,
      somaTamanho,
      somaDownloads,
      downloads7d: downloads7d ?? 0,
      uploads7d: envios7d ?? 0,
      categorias: categorias ?? 0,
    },
    comunicados: {
      total: comunicadosTotal ?? 0,
      ativos: comunicadosAtivos ?? 0,
      fixados: comunicadosFixados ?? 0,
      leituras: comunicadoLeituras ?? 0,
    },
    mensagens: {
      conversasAtivas: conversasAtivas ?? 0,
      totalMensagens: totalMensagens ?? 0,
      mensagens7d: mensagens7d ?? 0,
    },
    blog: {
      publicados: blogPublicados ?? 0,
      rascunhos: blogRascunhos ?? 0,
      arquivados: blogArquivados ?? 0,
      visualizacoes7d: blogVisualizacoes7d ?? 0,
    },
    convites: {
      pendentes: convitesPendentes ?? 0,
      aceitos30d: convitesAceitos30d ?? 0,
    },
    auditoria: {
      eventos7d: auditoria7d ?? 0,
      eventos24h: auditoria24h ?? 0,
      logins7d: logins7d ?? 0,
      envios7d: envios7d ?? 0,
      downloads7d: downloads7d ?? 0,
    },
  }
}

/** Indicadores do dashboard administrativo (legado) */
export async function buscarIndicadoresAdmin(): Promise<IndicadoresPainel> {
  const e = await buscarEstatisticasPainelAdmin()
  return {
    totalEmpresas: e.empresas.ativas,
    usuariosAtivos: e.usuarios.ativos,
    totalDocumentos: e.documentos.ativos,
    armazenamentoUsado: e.empresas.armazenamentoUsado,
    uploadsRecentes: e.documentos.uploads7d,
    downloadsRecentes: e.documentos.downloads7d,
  }
}

/** Dados agregados para a página inicial do portal docs */
export async function buscarDadosInicioDocs() {
  const perfil = await obterPerfilAtual()
  const supabase = await criarClienteSupabaseServidor()

  const [{ count: totalDocumentos }, { naoLidos }, { conversas }, documentosRecentes] = await Promise.all([
    supabase
      .from('documento_empresas')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', perfil?.empresa_id ?? ''),
    listarComunicadosEmpresa(),
    listarConversas(),
    listarDocumentosRecentes(5),
  ])

  return {
    primeiroNome: perfil?.nome_completo?.split(' ')[0] ?? 'usuário',
    totalDocumentos: totalDocumentos ?? 0,
    comunicadosNaoLidos: naoLidos,
    mensagensNovas: conversas.length,
    documentosRecentes: documentosRecentes as { id: string; titulo: string; criado_em: string }[],
  }
}

/** Painel admin - estatísticas */
export async function carregarPainelAdmin() {
  const estatisticas = await buscarEstatisticasPainelAdmin()
  return { estatisticas }
}
