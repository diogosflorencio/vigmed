import { notFound } from 'next/navigation'
import { FormularioPostBlog } from '@/components/blog/FormularioPostBlog'
import { obterPostBlogAdmin } from '@/lib/blog/acoes'

export const metadata = { title: 'Editar post · Blog VIGMED Admin' }

export default async function PaginaEditarPostBlog({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await obterPostBlogAdmin(id)
  if (!post) notFound()

  return <FormularioPostBlog post={post} />
}
