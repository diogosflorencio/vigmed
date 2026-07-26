import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RegistroVisualizacaoBlog } from '@/components/blog/RegistroVisualizacaoBlog'
import { obterPostBlogPublico } from '@/lib/blog/acoes'
import { obterUrlBaseDoAmbiente } from '@/lib/ambiente'
import { ROTAS } from '@/lib/rotas'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await obterPostBlogPublico(slug)
  if (!post) return { title: 'Post não encontrado' }

  const base = obterUrlBaseDoAmbiente('blog')
  const url = `${base}${ROTAS.blog.post(slug)}`
  const titulo = post.meta_titulo || post.titulo
  const descricao = post.meta_descricao || post.resumo || ''

  return {
    title: titulo,
    description: descricao,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: titulo,
      description: descricao,
      url,
      publishedTime: post.publicado_em ?? undefined,
      modifiedTime: post.atualizado_em,
      images: post.imagem_capa_url ? [{ url: post.imagem_capa_url }] : undefined,
      siteName: 'VIGMED Blog',
    },
    twitter: {
      card: post.imagem_capa_url ? 'summary_large_image' : 'summary',
      title: titulo,
      description: descricao,
      images: post.imagem_capa_url ? [post.imagem_capa_url] : undefined,
    },
  }
}

export default async function PaginaPostBlog({ params }: Props) {
  const { slug } = await params
  const post = await obterPostBlogPublico(slug)
  if (!post) notFound()

  const base = obterUrlBaseDoAmbiente('blog')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.titulo,
    description: post.resumo || post.meta_descricao,
    datePublished: post.publicado_em,
    dateModified: post.atualizado_em,
    image: post.imagem_capa_url,
    url: `${base}${ROTAS.blog.post(slug)}`,
    publisher: {
      '@type': 'Organization',
      name: 'VIGMED',
      url: obterUrlBaseDoAmbiente('site'),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <RegistroVisualizacaoBlog postId={post.id} />

      <div className="min-h-dvh">
        <header className="border-b border-[var(--glass-border)] glass-apple sticky top-0 z-30">
          <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
            <Link href={ROTAS.blog.home} className="text-sm font-medium text-primary hover:underline">
              ← Blog VIGMED
            </Link>
          </div>
        </header>

        <article className="mx-auto max-w-3xl px-4 py-10">
          <header className="mb-8">
            <time className="text-sm text-muted-foreground" dateTime={post.publicado_em ?? undefined}>
              {post.publicado_em
                ? new Date(post.publicado_em).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : ''}
            </time>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text-1)]">
              {post.titulo}
            </h1>
            {post.resumo && (
              <p className="mt-4 text-lg text-[var(--color-text-2)] leading-relaxed">{post.resumo}</p>
            )}
            {post.imagem_capa_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.imagem_capa_url}
                alt=""
                className="mt-8 w-full rounded-2xl object-cover max-h-[420px]"
              />
            )}
          </header>

          <div
            className="blog-prose"
            dangerouslySetInnerHTML={{ __html: post.corpo_html }}
          />

          {post.tags?.length > 0 && (
            <footer className="mt-12 pt-8 border-t border-[var(--glass-border)] flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-[var(--glass-nav-active)] text-[var(--color-text-2)]"
                >
                  {tag}
                </span>
              ))}
            </footer>
          )}
        </article>
      </div>
    </>
  )
}
