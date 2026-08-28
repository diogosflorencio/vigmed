'use server'

import { revalidatePath } from 'next/cache'
import { ROTAS } from '@/lib/rotas'
import { exigirAutenticacao } from '@/lib/auth/sessao'
import { criarClienteSupabaseServidor } from '@/lib/supabase/servidor'
import type { PreferenciasAparencia } from '@/lib/tema/tipos'
import { PREFERENCIAS_PADRAO, normalizarIdTemaVisual, normalizarModeloMenu } from '@/lib/tema/tipos'
import type { ModoTema } from '@/lib/tema/tipos'

export async function salvarPreferenciasAparencia(
  modo: ModoTema,
  temaVisual: PreferenciasAparencia['temaVisual'],
  modeloMenu?: PreferenciasAparencia['modeloMenu'],
) {
  const perfil = await exigirAutenticacao()
  const supabase = await criarClienteSupabaseServidor()

  const metadados = {
    ...(perfil.metadados ?? {}),
    aparencia: {
      modo,
      temaVisual: normalizarIdTemaVisual(temaVisual),
      modeloMenu: normalizarModeloMenu(modeloMenu),
    },
  }

  const { error } = await supabase
    .from('perfis')
    .update({ metadados })
    .eq('id', perfil.id)

  if (error) return { erro: 'Não foi possível salvar preferências.' }

  return { sucesso: true }
}

export async function salvarPreferenciasCompletas(prefs: PreferenciasAparencia) {
  return salvarPreferenciasAparencia(prefs.modo, prefs.temaVisual, prefs.modeloMenu)
}

export async function atualizarPerfil(dados: {
  nomeCompleto?: string
  telefone?: string
}) {
  const perfil = await exigirAutenticacao()
  const supabase = await criarClienteSupabaseServidor()

  const { error } = await supabase
    .from('perfis')
    .update({
      nome_completo: dados.nomeCompleto?.trim() ?? perfil.nome_completo,
      telefone: dados.telefone?.trim() || null,
    })
    .eq('id', perfil.id)

  if (error) return { erro: 'Não foi possível atualizar o perfil.' }

  revalidatePath(ROTAS.adm.perfil)
  revalidatePath(ROTAS.docs.perfil)

  return { sucesso: true }
}
