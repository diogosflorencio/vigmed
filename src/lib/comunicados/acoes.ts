'use server'

import { revalidatePath } from 'next/cache'
import { ROTAS } from '@/lib/rotas'
import { exigirAutenticacao, ehAdministrador, registrarAuditoria } from '@/lib/auth/sessao'
import { criarClienteSupabaseServidor } from '@/lib/supabase/servidor'
import type { Comunicado, PrioridadeComunicado } from '@/types'

export async function listarComunicadosAdmin(filtros?: {
  busca?: string
  aba?: 'ativos' | 'rascunhos' | 'historico'
}) {
  await exigirAutenticacao(['administrador'])
  const supabase = await criarClienteSupabaseServidor()

  let query = supabase.from('comunicados').select('*').order('fixado', { ascending: false }).order('publicado_em', { ascending: false })

  const aba = filtros?.aba
  if (aba === 'ativos') query = query.eq('ativo', true)
  else if (aba === 'rascunhos') query = query.eq('ativo', false).contains('metadados', { rascunho: true })
  else if (aba === 'historico') query = query.eq('ativo', false).not('metadados', 'cs', '{"rascunho":true}')

  if (filtros?.busca) {
    query = query.or(`titulo.ilike.%${filtros.busca}%,corpo.ilike.%${filtros.busca}%`)
  }

  const { data, error } = await query
  if (error) return { erro: 'Erro ao listar comunicados.', comunicados: [] as Comunicado[] }
  return { comunicados: (data ?? []) as Comunicado[] }
}

export async function listarComunicadosEmpresa() {
  const perfil = await exigirAutenticacao()
  const supabase = await criarClienteSupabaseServidor()

  const { data: todos } = await supabase
    .from('comunicados')
    .select('*')
    .eq('ativo', true)
    .order('fixado', { ascending: false })
    .order('publicado_em', { ascending: false })

  if (!todos) return { comunicados: [] as Comunicado[], naoLidos: 0 }

  if (ehAdministrador(perfil.papel) || !perfil.empresa_id) {
    return { comunicados: todos as Comunicado[], naoLidos: 0 }
  }

  const { data: vinculos } = await supabase
    .from('comunicado_empresas')
    .select('comunicado_id')
    .eq('empresa_id', perfil.empresa_id)

  const idsVinculados = new Set(vinculos?.map((v) => v.comunicado_id) ?? [])
  const filtrados = (todos as Comunicado[]).filter((c) => c.para_todos || idsVinculados.has(c.id))

  const { data: leituras } = await supabase
    .from('comunicado_leituras')
    .select('comunicado_id')
    .eq('usuario_id', perfil.id)

  const lidos = new Set(leituras?.map((l) => l.comunicado_id) ?? [])
  const naoLidos = filtrados.filter((c) => !lidos.has(c.id)).length

  return { comunicados: filtrados, naoLidos }
}

export async function publicarComunicado(dados: {
  titulo: string
  corpo: string
  prioridade: PrioridadeComunicado
  paraTodos: boolean
  empresaIds?: string[]
  fixado?: boolean
  rascunho?: boolean
}) {
  const perfil = await exigirAutenticacao(['administrador'])
  const supabase = await criarClienteSupabaseServidor()

  const { data: comunicado, error } = await supabase
    .from('comunicados')
    .insert({
      titulo: dados.titulo.trim(),
      corpo: dados.corpo.trim(),
      prioridade: dados.prioridade,
      para_todos: dados.paraTodos,
      fixado: dados.fixado ?? false,
      ativo: !dados.rascunho,
      autor_id: perfil.id,
      metadados: dados.rascunho ? { rascunho: true } : {},
    })
    .select('id')
    .single()

  if (error || !comunicado) return { erro: 'Não foi possível publicar o comunicado.' }

  if (!dados.paraTodos && dados.empresaIds?.length) {
    await supabase.from('comunicado_empresas').insert(
      dados.empresaIds.map((empresaId) => ({
        comunicado_id: comunicado.id,
        empresa_id: empresaId,
      })),
    )
  }

  await registrarAuditoria({
    acao: 'criacao',
    usuarioId: perfil.id,
    recurso: 'comunicado',
    recursoId: comunicado.id,
    detalhes: { titulo: dados.titulo, rascunho: dados.rascunho },
  })

  revalidatePath(ROTAS.adm.comunicados)
  revalidatePath(ROTAS.docs.comunicados)
  return { sucesso: true }
}

export async function marcarComunicadoLido(comunicadoId: string) {
  const perfil = await exigirAutenticacao()
  const supabase = await criarClienteSupabaseServidor()

  await supabase.from('comunicado_leituras').upsert({
    comunicado_id: comunicadoId,
    usuario_id: perfil.id,
  })

  revalidatePath('/docs/comunicados')
  revalidatePath(ROTAS.docs.painel)
  return { sucesso: true }
}

export async function contarEmpresasComunicado(comunicadoId: string) {
  const supabase = await criarClienteSupabaseServidor()
  const { count: totalEmpresas } = await supabase.from('empresas').select('*', { count: 'exact', head: true }).eq('status', 'ativo')
  const { data: vinculo } = await supabase.from('comunicado_empresas').select('empresa_id').eq('comunicado_id', comunicadoId)
  const { count: leituras } = await supabase
    .from('comunicado_leituras')
    .select('*', { count: 'exact', head: true })
    .eq('comunicado_id', comunicadoId)

  return {
    total: totalEmpresas ?? 0,
    destinatarios: vinculo?.length ? vinculo.length : totalEmpresas ?? 0,
    lidos: leituras ?? 0,
  }
}
