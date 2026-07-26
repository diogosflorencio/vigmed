import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'
import { normalizarEmail } from '@/lib/auth/convites'

/** Busca usuário em auth.users pelo e-mail (service role). */
export async function obterUsuarioAuthPorEmail(email: string) {
  const admin = criarClienteSupabaseAdmin()
  const alvo = normalizarEmail(email)
  let pagina = 1

  while (pagina <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page: pagina, perPage: 200 })
    if (error || !data.users.length) return null

    const encontrado = data.users.find(
      (usuario) => normalizarEmail(usuario.email ?? '') === alvo,
    )
    if (encontrado) return encontrado

    if (data.users.length < 200) return null
    pagina++
  }

  return null
}

export async function usuarioExisteNoAuth(email: string): Promise<boolean> {
  return (await obterUsuarioAuthPorEmail(email)) !== null
}
