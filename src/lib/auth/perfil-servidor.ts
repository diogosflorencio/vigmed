import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'
import { normalizarEmail, obterConvitePendente } from '@/lib/auth/convites'
import type { PapelUsuario } from '@/types'

export interface PerfilValidacao {
  id: string
  ativo: boolean
  papel: PapelUsuario
  email: string
}

type ResultadoValidacaoPerfil =
  | { erro: string }
  | { perfil: PerfilValidacao }

export async function sincronizarPerfilComConvite(usuarioId: string, email: string) {
  const convite = await obterConvitePendente(email)
  if (!convite) return

  const admin = criarClienteSupabaseAdmin()

  const { data: perfilExistente } = await admin
    .from('perfis')
    .select('id')
    .eq('id', usuarioId)
    .maybeSingle()

  const dadosPerfil = {
    email: normalizarEmail(email),
    nome_completo: convite.nome_completo || email.split('@')[0],
    papel: convite.papel,
    empresa_id: convite.empresa_id,
    ativo: true,
  }

  if (perfilExistente) {
    await admin.from('perfis').update(dadosPerfil).eq('id', usuarioId)
  } else {
    await admin.from('perfis').insert({ id: usuarioId, ...dadosPerfil })
  }

  await admin
    .from('convites_acesso')
    .update({ usado_em: new Date().toISOString(), usuario_id: usuarioId })
    .eq('id', convite.id)
}

export async function validarPerfilAposAutenticacao(
  usuarioId: string,
  email: string,
): Promise<ResultadoValidacaoPerfil> {
  await sincronizarPerfilComConvite(usuarioId, email)

  const admin = criarClienteSupabaseAdmin()
  const { data: perfil, error } = await admin
    .from('perfis')
    .select('id, ativo, papel, email')
    .eq('id', usuarioId)
    .single()

  if (error || !perfil) {
    return {
      erro: 'Perfil não encontrado. Use o mesmo e-mail do convite em /cadastro ou confirme seu e-mail no Supabase.',
    }
  }

  if (!perfil.ativo) {
    return {
      erro: 'Sua conta não está ativa. Verifique se o convite foi criado com o mesmo e-mail antes do cadastro.',
    }
  }

  const papeisValidos: PapelUsuario[] = [
    'administrador',
    'administrador_empresa',
    'usuario_empresa',
  ]
  if (!papeisValidos.includes(perfil.papel as PapelUsuario)) {
    return { erro: 'Seu perfil não possui permissão para acessar o sistema.' }
  }

  return { perfil: perfil as PerfilValidacao }
}

export async function obterPerfilPorIdServidor(usuarioId: string) {
  const admin = criarClienteSupabaseAdmin()
  const { data } = await admin
    .from('perfis')
    .select('*, empresas(*)')
    .eq('id', usuarioId)
    .single()
  return data
}
