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
