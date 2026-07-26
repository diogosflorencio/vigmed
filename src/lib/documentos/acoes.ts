'use server'

import { revalidatePath } from 'next/cache'
import { exigirAutenticacao, ehAdministrador, registrarAuditoria } from '@/lib/auth/sessao'
import { recalcularArmazenamentoEmpresa } from '@/lib/documentos/armazenamento'
import { excluirArquivoR2 } from '@/lib/r2/cliente'
import { ROTAS } from '@/lib/rotas'
import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'
import { criarClienteSupabaseServidor } from '@/lib/supabase/servidor'

async function obterDocumentoComEmpresas(documentoId: string) {
  const admin = criarClienteSupabaseAdmin()
  const { data } = await admin
    .from('documentos')
    .select('*, documento_empresas(empresa_id)')
    .eq('id', documentoId)
    .eq('ativo', true)
    .maybeSingle()
  return data
}

function perfilPodeExcluirDocumento(
  perfil: Awaited<ReturnType<typeof exigirAutenticacao>>,
  documento: { enviado_por: string | null; origem_publicacao?: string | null },
) {
  if (ehAdministrador(perfil.papel)) return true
  return documento.enviado_por === perfil.id && documento.origem_publicacao === 'empresa'
}

function perfilPodeGerenciarCompartilhamento(
  perfil: Awaited<ReturnType<typeof exigirAutenticacao>>,
  documento: { enviado_por: string | null },
) {
  if (ehAdministrador(perfil.papel)) return true
  return documento.enviado_por === perfil.id
}

export async function listarDocumentos(filtros?: {
  busca?: string
  empresaId?: string
  categoriaId?: string
}) {
  const perfil = await exigirAutenticacao()
  const supabase = await criarClienteSupabaseServidor()

  if (ehAdministrador(perfil.papel)) {
    let query = supabase
      .from('documentos')
      .select('*, categorias(nome, slug), documento_empresas(empresa_id, empresas(nome_fantasia))')
      .eq('ativo', true)
      .order('criado_em', { ascending: false })

    if (filtros?.busca) query = query.ilike('titulo', `%${filtros.busca}%`)
    if (filtros?.categoriaId) query = query.eq('categoria_id', filtros.categoriaId)

    const { data, error } = await query
    if (error) return { erro: 'Erro ao listar documentos.', documentos: [] }

    let docs = data ?? []
    if (filtros?.empresaId) {
      docs = docs.filter((d) =>
        (d.documento_empresas as { empresa_id: string }[])?.some((de) => de.empresa_id === filtros.empresaId),
      )
    }

    const ids = docs.map((d) => d.id)
    const visualizacoes = new Map<string, number>()
    if (ids.length) {
      const admin = criarClienteSupabaseAdmin()
      const { data: acessos } = await admin
        .from('documento_acessos')
        .select('documento_id')
        .eq('acao', 'visualizacao')
        .in('documento_id', ids)

      for (const acesso of acessos ?? []) {
        visualizacoes.set(
          acesso.documento_id,
          (visualizacoes.get(acesso.documento_id) ?? 0) + 1,
        )
      }
    }

    return {
      documentos: docs.map((d) => ({
        ...d,
        total_visualizacoes: visualizacoes.get(d.id) ?? 0,
      })),
    }
  }

  if (!perfil.empresa_id) return { documentos: [] }

  const { data: vinculos } = await supabase
    .from('documento_empresas')
    .select('documento_id')
    .eq('empresa_id', perfil.empresa_id)

  const ids = vinculos?.map((v) => v.documento_id) ?? []
  if (!ids.length) return { documentos: [] }

  let query = supabase
    .from('documentos')
    .select('*, categorias(nome, slug)')
    .in('id', ids)
    .eq('ativo', true)
    .order('criado_em', { ascending: false })

  if (filtros?.busca) query = query.ilike('titulo', `%${filtros.busca}%`)

  const { data } = await query
  return { documentos: data ?? [] }
}

export async function listarCategorias() {
  const supabase = await criarClienteSupabaseServidor()
  const { data } = await supabase.from('categorias').select('*').order('ordem')
  return data ?? []
}

export async function listarDocumentosRecentes(limite = 5) {
  const perfil = await exigirAutenticacao()
  const supabase = await criarClienteSupabaseServidor()

  if (ehAdministrador(perfil.papel)) {
    const { data } = await supabase
      .from('documentos')
      .select('id, titulo, nome_arquivo, criado_em, documento_empresas(empresas(nome_fantasia))')
      .eq('ativo', true)
      .order('criado_em', { ascending: false })
      .limit(limite)
    return data ?? []
  }

  if (!perfil.empresa_id) return []

  const { data: vinculos } = await supabase
    .from('documento_empresas')
    .select('documento_id')
    .eq('empresa_id', perfil.empresa_id)

  const ids = vinculos?.map((v) => v.documento_id) ?? []
  if (!ids.length) return []

  const { data } = await supabase
    .from('documentos')
    .select('id, titulo, nome_arquivo, criado_em')
    .in('id', ids)
    .eq('ativo', true)
    .order('criado_em', { ascending: false })
    .limit(limite)

  return data ?? []
}

export async function excluirDocumento(documentoId: string) {
  const perfil = await exigirAutenticacao([
    'administrador',
    'administrador_empresa',
    'usuario_empresa',
  ])

  const documento = await obterDocumentoComEmpresas(documentoId)
  if (!documento) return { erro: 'Documento não encontrado.' }

  if (!perfilPodeExcluirDocumento(perfil, documento)) {
    return { erro: 'Sem permissão para excluir este documento.' }
  }

  const admin = criarClienteSupabaseAdmin()
  const empresaIds = (documento.documento_empresas as { empresa_id: string }[]).map((de) => de.empresa_id)

  try {
    await excluirArquivoR2(documento.chave_arquivo)
  } catch {
    // Arquivo pode já ter sido removido do bucket
  }

  const { error } = await admin.from('documentos').update({ ativo: false }).eq('id', documentoId)
  if (error) return { erro: 'Erro ao excluir documento.' }

  for (const empresaId of empresaIds) {
    await recalcularArmazenamentoEmpresa(empresaId)
  }

  await registrarAuditoria({
    acao: 'exclusao',
    usuarioId: perfil.id,
    empresaId: perfil.empresa_id ?? undefined,
    recurso: 'documento',
    recursoId: documentoId,
  })

  revalidatePath(ROTAS.adm.documentos)
  revalidatePath(ROTAS.docs.documentos)
  for (const empresaId of empresaIds) {
    revalidatePath(ROTAS.adm.empresaDocumentos(empresaId))
  }
  return { sucesso: true }
}

export async function alternarCompartilhamentoDocumento(documentoId: string, permitir: boolean) {
  const perfil = await exigirAutenticacao([
    'administrador',
    'administrador_empresa',
    'usuario_empresa',
  ])

  const documento = await obterDocumentoComEmpresas(documentoId)
  if (!documento) return { erro: 'Documento não encontrado.' }

  if (!perfilPodeGerenciarCompartilhamento(perfil, documento)) {
    return { erro: 'Sem permissão para alterar compartilhamento.' }
  }

  const admin = criarClienteSupabaseAdmin()
  const { error } = await admin
    .from('documentos')
    .update({ permitir_compartilhar: permitir })
    .eq('id', documentoId)

  if (error) return { erro: 'Erro ao atualizar compartilhamento.' }

  await admin.from('documento_acessos').insert({
    documento_id: documentoId,
    usuario_id: perfil.id,
    empresa_id: perfil.empresa_id,
    acao: 'compartilhamento',
  })

  revalidatePath(ROTAS.adm.documentos)
  revalidatePath(ROTAS.docs.documentos)
  revalidatePath(ROTAS.doc.arquivo(documentoId))
  return { sucesso: true, permitir_compartilhar: permitir }
}

export async function obterDocumentoPublico(documentoId: string) {
  const admin = criarClienteSupabaseAdmin()
  const { data } = await admin
    .from('documentos')
    .select('id, titulo, nome_arquivo, tipo_mime, extensao, permitir_compartilhar, ativo, criado_em')
    .eq('id', documentoId)
    .maybeSingle()

  if (!data || !data.ativo) return { privado: true as const, motivo: 'nao_encontrado' as const }
  if (!data.permitir_compartilhar) return { privado: true as const, motivo: 'privado' as const, titulo: data.titulo }

  return { privado: false as const, documento: data }
}

export async function registrarVisualizacaoPublica(documentoId: string) {
  const admin = criarClienteSupabaseAdmin()
  const doc = await obterDocumentoPublico(documentoId)
  if (doc.privado) return null

  await admin.from('documento_acessos').insert({
    documento_id: documentoId,
    acao: 'visualizacao',
  })

  return doc.documento
}

export async function urlVisualizacaoPublica(documentoId: string) {
  const doc = await obterDocumentoPublico(documentoId)
  if (doc.privado) return { erro: 'Documento privado ou indisponível.' }

  const { gerarUrlDownloadAssinada } = await import('@/lib/r2/cliente')
  const admin = criarClienteSupabaseAdmin()
  const { data: documento } = await admin
    .from('documentos')
    .select('chave_arquivo, nome_arquivo')
    .eq('id', documentoId)
    .single()

  if (!documento) return { erro: 'Documento não encontrado.' }

  const url = await gerarUrlDownloadAssinada(documento.chave_arquivo, documento.nome_arquivo, {
    inline: true,
  })

  return { url }
}

export async function obterDocumentoDetalhe(documentoId: string) {
  const perfil = await exigirAutenticacao()
  const admin = criarClienteSupabaseAdmin()

  const { data: documento } = await admin
    .from('documentos')
    .select('*, categorias(nome), documento_empresas(empresa_id, empresas(nome_fantasia))')
    .eq('id', documentoId)
    .eq('ativo', true)
    .maybeSingle()

  if (!documento) return { erro: 'Documento não encontrado.' }

  let enviadoPor: { nome_completo: string; email: string } | null = null
  if (documento.enviado_por) {
    const { data: perfilEnvio } = await admin
      .from('perfis')
      .select('nome_completo, email')
      .eq('id', documento.enviado_por)
      .maybeSingle()
    enviadoPor = perfilEnvio
  }

  const empresaIds = (documento.documento_empresas as { empresa_id: string }[]).map((de) => de.empresa_id)

  if (!ehAdministrador(perfil.papel)) {
    if (!perfil.empresa_id || !empresaIds.includes(perfil.empresa_id)) {
      return { erro: 'Sem permissão.' }
    }
  }

  const [{ count: visualizacoes }, { count: downloads }] = await Promise.all([
    admin
      .from('documento_acessos')
      .select('*', { count: 'exact', head: true })
      .eq('documento_id', documentoId)
      .eq('acao', 'visualizacao'),
    admin
      .from('documento_acessos')
      .select('*', { count: 'exact', head: true })
      .eq('documento_id', documentoId)
      .eq('acao', 'download'),
  ])

  return {
    documento: {
      ...documento,
      enviado_por_perfil: enviadoPor,
      total_visualizacoes: visualizacoes ?? 0,
      total_downloads_registrados: downloads ?? 0,
      empresa_ids: empresaIds,
    },
  }
}

export async function obterUrlPreviewDocumento(documentoId: string) {
  const resultado = await obterDocumentoDetalhe(documentoId)
  if ('erro' in resultado && resultado.erro) return { erro: resultado.erro }

  const doc = resultado.documento!
  const { gerarUrlDownloadAssinada } = await import('@/lib/r2/cliente')
  const url = await gerarUrlDownloadAssinada(doc.chave_arquivo, doc.nome_arquivo, { inline: true })
  return { url, tipoMime: doc.tipo_mime, nomeArquivo: doc.nome_arquivo }
}

export async function atualizarEmpresasDocumento(documentoId: string, empresaIds: string[]) {
  const perfil = await exigirAutenticacao(['administrador', 'administrador_empresa', 'usuario_empresa'])

  const documento = await obterDocumentoComEmpresas(documentoId)
  if (!documento) return { erro: 'Documento não encontrado.' }

  if (!ehAdministrador(perfil.papel)) {
    if (documento.enviado_por !== perfil.id) {
      return { erro: 'Sem permissão para alterar empresas deste documento.' }
    }
  }

  if (!empresaIds.length) {
    return { erro: 'Selecione ao menos uma empresa.' }
  }

  const admin = criarClienteSupabaseAdmin()
  const atuais = (documento.documento_empresas as { empresa_id: string }[]).map((de) => de.empresa_id)
  const novas = [...new Set(empresaIds)]
  const adicionar = novas.filter((id) => !atuais.includes(id))
  const remover = atuais.filter((id) => !novas.includes(id))

  if (adicionar.length) {
    await admin.from('documento_empresas').insert(
      adicionar.map((empresaId) => ({ documento_id: documentoId, empresa_id: empresaId })),
    )
  }

  for (const empresaId of remover) {
    await admin
      .from('documento_empresas')
      .delete()
      .eq('documento_id', documentoId)
      .eq('empresa_id', empresaId)
  }

  for (const empresaId of [...new Set([...atuais, ...novas])]) {
    await recalcularArmazenamentoEmpresa(empresaId)
  }

  revalidatePath(ROTAS.adm.documentos)
  revalidatePath(ROTAS.docs.documentos)
  for (const empresaId of novas) {
    revalidatePath(ROTAS.adm.empresaDocumentos(empresaId))
  }
  for (const empresaId of remover) {
    revalidatePath(ROTAS.adm.empresaDocumentos(empresaId))
  }

  return { sucesso: true }
}
