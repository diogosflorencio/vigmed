import { PainelBlogAdm } from '@/components/blog/PainelBlogAdm'
import { listarPostsBlogAdmin, obterEstatisticasPosts } from '@/lib/blog/acoes'

export const metadata = { title: 'Blog - VIGMED Admin' }

export default async function PaginaBlogAdmin() {
  const { posts } = await listarPostsBlogAdmin()
  const estatisticas = await obterEstatisticasPosts(posts.map((p) => p.id))

  return <PainelBlogAdm postsIniciais={posts} estatisticas={estatisticas} />
}
