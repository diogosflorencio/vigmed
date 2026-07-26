import { gerarSlug } from '@/lib/blog/gerar-slug'
import { criarClienteSupabaseAdmin } from '@/lib/supabase/admin'

export { gerarSlug }

/** Garante slug único acrescentando sufixo numérico se necessário */
export async function garantirSlugUnico(
  slugBase: string,
  excluirId?: string,
): Promise<string> {
  const supabase = criarClienteSupabaseAdmin()
  let slug = slugBase
  let tentativa = 0

  while (tentativa < 50) {
    let query = supabase.from('posts_blog').select('id').eq('slug', slug).limit(1)
    if (excluirId) query = query.neq('id', excluirId)
    const { data } = await query
    if (!data?.length) return slug
    tentativa += 1
    slug = `${slugBase}-${tentativa}`
  }

  return `${slugBase}-${Date.now()}`
}
