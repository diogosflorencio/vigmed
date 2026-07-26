'use server'

import { revalidatePath } from 'next/cache'
import { ROTAS } from '@/lib/rotas'
import { exigirAutenticacao, registrarAuditoria } from '@/lib/auth/sessao'
import { criarClienteSupabaseServidor } from '@/lib/supabase/servidor'
import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'
import { gerarSlug, garantirSlugUnico } from '@/lib/blog/slug'
import type { DadosSalvarPostBlog, EstatisticasPostBlog, StatusPostBlog } from '@/lib/blog/tipos'
import type { PostBlog as PostBlogType } from '@/types'
import type { PostgrestError } from '@supabase/supabase-js'

function mensagemErroPost(error: PostgrestError | null, acao: 'criar' | 'atualizar' | 'excluir' | 'status'): string {
  const padrao = {
    criar: 'Não foi possível criar o post.',
    atualizar: 'Não foi possível atualizar o post.',
    excluir: 'Não foi possível excluir o post.',
    status: 'Não foi possível alterar o status.',
  }[acao]

  if (!error) return padrao

  if (error.code === '42P01' || error.code === 'PGRST205') {
    return 'Módulo do blog não está disponível na API. No Supabase: SQL Editor → execute NOTIFY pgrst, \'reload schema\'; ou aplique a migration 007_blog_garantir_api.'
  }
  if (error.code === '23505') {
    return 'Já existe um post com este slug.'
  }
  if (error.code === '23503') {
    return 'Perfil do autor inválido. Verifique se sua conta está ativa no sistema.'
  }

  if (process.env.NODE_ENV === 'development') {
    return `${padrao} ${error.message}${error.code ? ` (${error.code})` : ''}`
  }

  return padrao
}

function revalidarBlog(slug?: string) {
  revalidatePath(ROTAS.adm.blog)
  revalidatePath(ROTAS.blog.home)
  if (slug) revalidatePath(ROTAS.blog.post(slug))
}

/** Lista todos os posts para o painel admin */
export async function listarPostsBlogAdmin(filtros?: {
  busca?: string
  status?: StatusPostBlog | 'todos'
}) {
  await exigirAutenticacao(['administrador'])
  const supabase = criarClienteSupabaseAdmin()

  let query = supabase
    .from('posts_blog')
    .select('*')
    .order('atualizado_em', { ascending: false })

  if (filtros?.status && filtros.status !== 'todos') {
    query = query.eq('status', filtros.status)
  }

  if (filtros?.busca) {
    query = query.or(
      `titulo.ilike.%${filtros.busca}%,resumo.ilike.%${filtros.busca}%,slug.ilike.%${filtros.busca}%`,
    )
  }

  const { data, error } = await query
  if (error) return { erro: 'Erro ao listar posts.', posts: [] as PostBlogType[] }
  return { posts: (data ?? []) as PostBlogType[] }
}

/** Posts publicados para o blog público */
export async function listarPostsBlogPublicos(limite = 50) {
  const supabase = await criarClienteSupabaseServidor()

  const { data, error } = await supabase
    .from('posts_blog')
    .select('*')
    .eq('status', 'publicado')
    .lte('publicado_em', new Date().toISOString())
    .order('publicado_em', { ascending: false })
    .limit(limite)

  if (error) return { posts: [] as PostBlogType[] }
  return { posts: (data ?? []) as PostBlogType[] }
}

/** Busca post publicado por slug */
export async function obterPostBlogPublico(slug: string) {
  const supabase = await criarClienteSupabaseServidor()

  const { data, error } = await supabase
    .from('posts_blog')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'publicado')
    .lte('publicado_em', new Date().toISOString())
    .maybeSingle()

  if (error || !data) return null
  return data as PostBlogType
}

/** Busca post por id (admin) */
export async function obterPostBlogAdmin(id: string) {
  await exigirAutenticacao(['administrador'])
  const supabase = criarClienteSupabaseAdmin()

  const { data, error } = await supabase.from('posts_blog').select('*').eq('id', id).maybeSingle()
  if (error || !data) return null
  return data as PostBlogType
}

/** Cria novo post */
export async function criarPostBlog(dados: DadosSalvarPostBlog) {
  const perfil = await exigirAutenticacao(['administrador'])
  const supabase = criarClienteSupabaseAdmin()

  const slugBase = gerarSlug(dados.slug?.trim() || dados.titulo)
  const slug = await garantirSlugUnico(slugBase)
  const publicar = dados.status === 'publicado' || dados.publicar

  const { data: post, error } = await supabase
    .from('posts_blog')
    .insert({
      titulo: dados.titulo.trim(),
      slug,
      resumo: dados.resumo?.trim() || null,
      corpo_html: dados.corpoHtml,
      imagem_capa_url: dados.imagemCapaUrl ?? null,
      imagem_capa_chave: dados.imagemCapaChave ?? null,
      meta_titulo: dados.metaTitulo?.trim() || dados.titulo.trim(),
      meta_descricao: dados.metaDescricao?.trim() || dados.resumo?.trim() || null,
      tags: dados.tags ?? [],
      status: publicar ? 'publicado' : dados.status,
      publicado_em: publicar ? new Date().toISOString() : null,
      autor_id: perfil.id,
    })
    .select('id, slug')
    .single()

  if (error || !post) return { erro: mensagemErroPost(error, 'criar') }

  await registrarAuditoria({
    acao: 'criacao',
    usuarioId: perfil.id,
    recurso: 'post_blog',
    recursoId: post.id,
    detalhes: { titulo: dados.titulo, slug: post.slug, status: publicar ? 'publicado' : dados.status },
  })

  revalidarBlog(post.slug)
  return { sucesso: true, id: post.id, slug: post.slug }
}

/** Atualiza post existente */
export async function atualizarPostBlog(id: string, dados: DadosSalvarPostBlog) {
  const perfil = await exigirAutenticacao(['administrador'])
  const supabase = criarClienteSupabaseAdmin()

  const slugBase = gerarSlug(dados.slug?.trim() || dados.titulo)
  const slug = await garantirSlugUnico(slugBase, id)
  const publicar = dados.status === 'publicado' || dados.publicar

  const atualizacao: Record<string, unknown> = {
    titulo: dados.titulo.trim(),
    slug,
    resumo: dados.resumo?.trim() || null,
    corpo_html: dados.corpoHtml,
    imagem_capa_url: dados.imagemCapaUrl ?? null,
    imagem_capa_chave: dados.imagemCapaChave ?? null,
    meta_titulo: dados.metaTitulo?.trim() || dados.titulo.trim(),
    meta_descricao: dados.metaDescricao?.trim() || dados.resumo?.trim() || null,
    tags: dados.tags ?? [],
    status: publicar ? 'publicado' : dados.status,
  }

  if (publicar) {
    const { data: existente } = await supabase
      .from('posts_blog')
      .select('publicado_em')
      .eq('id', id)
      .single()
    if (!existente?.publicado_em) {
      atualizacao.publicado_em = new Date().toISOString()
    }
  }

  const { error } = await supabase.from('posts_blog').update(atualizacao).eq('id', id)
  if (error) return { erro: mensagemErroPost(error, 'atualizar') }

  await registrarAuditoria({
    acao: 'atualizacao',
    usuarioId: perfil.id,
    recurso: 'post_blog',
    recursoId: id,
    detalhes: { titulo: dados.titulo, slug, status: atualizacao.status },
  })

  revalidarBlog(slug)
  return { sucesso: true, slug }
}

/** Arquiva ou exclui post */
export async function alterarStatusPostBlog(id: string, status: StatusPostBlog) {
  const perfil = await exigirAutenticacao(['administrador'])
  const supabase = criarClienteSupabaseAdmin()

  const { data: post } = await supabase.from('posts_blog').select('slug, titulo').eq('id', id).single()
  if (!post) return { erro: 'Post não encontrado.' }

  const { error } = await supabase.from('posts_blog').update({ status }).eq('id', id)
  if (error) return { erro: mensagemErroPost(error, 'status') }

  await registrarAuditoria({
    acao: 'atualizacao',
    usuarioId: perfil.id,
    recurso: 'post_blog',
    recursoId: id,
    detalhes: { titulo: post.titulo, status },
  })

  revalidarBlog(post.slug)
  return { sucesso: true }
}

export async function excluirPostBlog(id: string) {
  const perfil = await exigirAutenticacao(['administrador'])
  const supabase = criarClienteSupabaseAdmin()

  const { data: post } = await supabase.from('posts_blog').select('slug, titulo').eq('id', id).single()
  if (!post) return { erro: 'Post não encontrado.' }

  const { error } = await supabase.from('posts_blog').delete().eq('id', id)
  if (error) return { erro: mensagemErroPost(error, 'excluir') }

  await registrarAuditoria({
    acao: 'exclusao',
    usuarioId: perfil.id,
    recurso: 'post_blog',
    recursoId: id,
    detalhes: { titulo: post.titulo },
  })

  revalidarBlog(post.slug)
  return { sucesso: true }
}

/** Estatísticas de visualização por post */
export async function obterEstatisticasPosts(ids: string[]): Promise<EstatisticasPostBlog[]> {
  await exigirAutenticacao(['administrador'])
  if (!ids.length) return []

  const supabase = criarClienteSupabaseAdmin()
  const agora = new Date()
  const ha7d = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const ha30d = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: posts } = await supabase
    .from('posts_blog')
    .select('id, total_visualizacoes')
    .in('id', ids)

  const { data: visualizacoes } = await supabase
    .from('blog_visualizacoes')
    .select('post_id, visualizado_em')
    .in('post_id', ids)
    .gte('visualizado_em', ha30d)

  return ids.map((postId) => {
    const post = posts?.find((p) => p.id === postId)
    const views = visualizacoes?.filter((v) => v.post_id === postId) ?? []
    const ordenadas = [...views].sort(
      (a, b) => new Date(b.visualizado_em).getTime() - new Date(a.visualizado_em).getTime(),
    )
    return {
      postId,
      totalVisualizacoes: post?.total_visualizacoes ?? 0,
      visualizacoes7d: views.filter((v) => v.visualizado_em >= ha7d).length,
      visualizacoes30d: views.length,
      ultimaVisualizacao: ordenadas[0]?.visualizado_em ?? null,
    }
  })
}

/** Registra visualização (service role) */
export async function registrarVisualizacaoPost(
  postId: string,
  origem?: string,
  sessaoHash?: string,
  usuarioId?: string | null,
) {
  const admin = criarClienteSupabaseAdmin()

  const { data: post } = await admin
    .from('posts_blog')
    .select('id, status, publicado_em')
    .eq('id', postId)
    .single()

  if (!post || post.status !== 'publicado') return { ok: false }

  await admin.from('blog_visualizacoes').insert({
    post_id: postId,
    origem: origem ?? null,
    sessao_hash: sessaoHash ?? null,
    usuario_id: usuarioId ?? null,
  })

  const { data: atual } = await admin
    .from('posts_blog')
    .select('total_visualizacoes')
    .eq('id', postId)
    .single()

  await admin
    .from('posts_blog')
    .update({ total_visualizacoes: (atual?.total_visualizacoes ?? 0) + 1 })
    .eq('id', postId)

  return { ok: true }
}
