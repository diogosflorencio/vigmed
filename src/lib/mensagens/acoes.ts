'use server'

import { revalidatePath } from 'next/cache'
import { ROTAS } from '@/lib/rotas'
import { exigirAutenticacao, ehAdministrador, registrarAuditoria } from '@/lib/auth/sessao'
import { criarClienteSupabaseServidor } from '@/lib/supabase/servidor'

export async function listarConversas() {
  const perfil = await exigirAutenticacao()
  const supabase = await criarClienteSupabaseServidor()

  let query = supabase
    .from('conversas')
    .select('*, empresas(nome_fantasia), mensagens(id, corpo, criado_em, remetente_id, perfis(nome_completo))')
    .eq('ativo', true)
    .order('atualizado_em', { ascending: false })

  if (!ehAdministrador(perfil.papel) && perfil.empresa_id) {
    query = query.eq('empresa_id', perfil.empresa_id)
  }

  const { data, error } = await query
  if (error) return { conversas: [] }
  return { conversas: data ?? [] }
}

export async function criarConversa(assunto: string, empresaId?: string) {
  const perfil = await exigirAutenticacao()
  const supabase = await criarClienteSupabaseServidor()

  const empresa = ehAdministrador(perfil.papel) ? empresaId : perfil.empresa_id
  if (!empresa) return { erro: 'Empresa não informada.' }

  const { data, error } = await supabase
    .from('conversas')
    .insert({ assunto: assunto.trim(), empresa_id: empresa })
    .select('id')
    .single()

  if (error || !data) return { erro: 'Não foi possível criar a conversa.' }

  revalidatePath(ROTAS.adm.mensagens)
  revalidatePath(ROTAS.docs.mensagens)
  revalidatePath(ROTAS.adm.painel)
  return { sucesso: true, conversaId: data.id }
}

export async function enviarMensagem(conversaId: string, corpo: string) {
  const perfil = await exigirAutenticacao()
  const supabase = await criarClienteSupabaseServidor()

  const { error } = await supabase.from('mensagens').insert({
    conversa_id: conversaId,
    remetente_id: perfil.id,
    corpo: corpo.trim(),
  })

  if (error) return { erro: 'Não foi possível enviar a mensagem.' }

  await supabase.from('conversas').update({ atualizado_em: new Date().toISOString() }).eq('id', conversaId)

  await registrarAuditoria({
    acao: 'criacao',
    usuarioId: perfil.id,
    recurso: 'mensagem',
    recursoId: conversaId,
  })

  revalidatePath(ROTAS.adm.mensagens)
  revalidatePath(ROTAS.docs.mensagens)
  revalidatePath(ROTAS.adm.painel)
  return { sucesso: true }
}

export async function listarMensagens(conversaId: string) {
  await exigirAutenticacao()
  const supabase = await criarClienteSupabaseServidor()

  const { data } = await supabase
    .from('mensagens')
    .select('*, perfis(nome_completo, email)')
    .eq('conversa_id', conversaId)
    .order('criado_em', { ascending: true })

  return data ?? []
}

/** Retorna conversa ativa da empresa ou cria uma nova (admin) */
export async function garantirConversaEmpresa(empresaId: string) {
  const perfil = await exigirAutenticacao()
  if (!ehAdministrador(perfil.papel)) return { erro: 'Sem permissão.' }

  const supabase = await criarClienteSupabaseServidor()

  const { data: existente } = await supabase
    .from('conversas')
    .select('id')
    .eq('empresa_id', empresaId)
    .eq('ativo', true)
    .order('atualizado_em', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existente) return { conversaId: existente.id }

  const { data: empresa } = await supabase
    .from('empresas')
    .select('nome_fantasia')
    .eq('id', empresaId)
    .single()

  const { data, error } = await supabase
    .from('conversas')
    .insert({
      assunto: empresa?.nome_fantasia ?? 'Conversa',
      empresa_id: empresaId,
    })
    .select('id')
    .single()

  if (error || !data) return { erro: 'Não foi possível iniciar a conversa.' }

  revalidatePath(ROTAS.adm.painel)
  revalidatePath(ROTAS.adm.mensagens)
  return { conversaId: data.id }
}
