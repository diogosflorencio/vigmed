'use server'

import { revalidatePath } from 'next/cache'
import { ROTAS } from '@/lib/rotas'
import { exigirAutenticacao } from '@/lib/auth/sessao'
import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'

export async function listarConfiguracoes() {
  await exigirAutenticacao(['administrador'])
  const supabase = criarClienteSupabaseAdmin()
  const { data } = await supabase.from('configuracoes').select('*').order('chave')
  return data ?? []
}

export async function salvarConfiguracao(chave: string, valor: unknown) {
  await exigirAutenticacao(['administrador'])
  const supabase = criarClienteSupabaseAdmin()

  const { error } = await supabase.from('configuracoes').upsert({
    chave,
    valor: valor as Record<string, unknown>,
    atualizado_em: new Date().toISOString(),
  })

  if (error) return { erro: 'Não foi possível salvar a configuração.' }

  revalidatePath(ROTAS.adm.configuracoes)
  return { sucesso: true }
}
