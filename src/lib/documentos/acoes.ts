'use server'

import { exigirAutenticacao, ehAdministrador } from '@/lib/auth/sessao'
import { criarClienteSupabaseServidor } from '@/lib/supabase/servidor'

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
    return { documentos: docs }
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
