'use server'

import { revalidatePath } from 'next/cache'
import { exigirAutenticacao, registrarAuditoria } from '@/lib/auth/sessao'
import { criarClienteSupabaseServidor } from '@/lib/supabase/servidor'
import { ROTAS } from '@/lib/rotas'
import type { Empresa, StatusEmpresa } from '@/types'

export async function listarEmpresas(filtros?: { busca?: string; status?: StatusEmpresa | '' }) {
  await exigirAutenticacao(['administrador'])
  const supabase = await criarClienteSupabaseServidor()

  let query = supabase.from('empresas').select('*').order('nome_fantasia')

  if (filtros?.status) query = query.eq('status', filtros.status)
  if (filtros?.busca) {
    const termo = filtros.busca.trim().toLowerCase()
    // Filtro aplicado no cliente quando necessário; busca simples no servidor
    query = query.ilike('nome_fantasia', `%${termo}%`)
  }

  const { data, error } = await query
  if (error) return { erro: 'Erro ao listar empresas.', empresas: [] as Empresa[] }
  return { empresas: (data ?? []) as Empresa[] }
}

export async function salvarEmpresa(dados: {
  id?: string
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  email: string
  telefone?: string
  responsavel?: string
  status?: StatusEmpresa
  armazenamentoLimite?: number
}) {
  const perfil = await exigirAutenticacao(['administrador'])
  const supabase = await criarClienteSupabaseServidor()

  const cnpjLimpo = dados.cnpj.replace(/\D/g, '')
  const payload = {
    razao_social: dados.razaoSocial.trim(),
    nome_fantasia: dados.nomeFantasia.trim(),
    cnpj: cnpjLimpo,
    email: dados.email.trim(),
    telefone: dados.telefone?.trim() || null,
    responsavel: dados.responsavel?.trim() || null,
    status: dados.status ?? 'ativo',
    armazenamento_limite: dados.armazenamentoLimite ?? 5368709120,
  }

  if (dados.id) {
    const { error } = await supabase.from('empresas').update(payload).eq('id', dados.id)
    if (error) return { erro: 'Não foi possível atualizar a empresa.' }
    await registrarAuditoria({
      acao: 'atualizacao_empresa',
      usuarioId: perfil.id,
      recurso: 'empresa',
      recursoId: dados.id,
      detalhes: { nome: payload.nome_fantasia },
    })
  } else {
    const { data, error } = await supabase.from('empresas').insert(payload).select('id').single()
    if (error) return { erro: error.code === '23505' ? 'CNPJ já cadastrado.' : 'Erro ao criar empresa.' }
    await registrarAuditoria({
      acao: 'criacao_empresa',
      usuarioId: perfil.id,
      recurso: 'empresa',
      recursoId: data.id,
      detalhes: { nome: payload.nome_fantasia },
    })
  }

  revalidatePath(ROTAS.adm.empresas)
  return { sucesso: true }
}

export async function listarEmpresasResumo() {
  const supabase = await criarClienteSupabaseServidor()
  const { data } = await supabase
    .from('empresas')
    .select('id, nome_fantasia, status')
    .eq('status', 'ativo')
    .order('nome_fantasia')
  return data ?? []
}
