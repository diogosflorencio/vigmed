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

      <div className="vig-blog-shell min-h-dvh">
        <header className="vig-blog-header">
          <div className="vig-blog-header-inner vig-blog-header-inner--estreito">
            <Link href={ROTAS.blog.home} className="vig-blog-voltar">
              ← Blog VIGMED
            </Link>
          </div>
        </header>

        <article className="vig-blog-artigo">
          <header className="vig-blog-artigo-cabecalho">
            <time className="vig-blog-data" dateTime={post.publicado_em ?? undefined}>
              {post.publicado_em
                ? new Date(post.publicado_em).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : ''}
            </time>
            <h1 className="vig-blog-artigo-titulo">{post.titulo}</h1>
            {post.resumo && <p className="vig-blog-artigo-resumo">{post.resumo}</p>}
            {post.imagem_capa_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.imagem_capa_url} alt="" className="vig-blog-artigo-capa" />
            )}
          </header>

          <div className="blog-prose vig-blog-prose" dangerouslySetInnerHTML={{ __html: post.corpo_html }} />

          {post.tags?.length > 0 && (
            <footer className="vig-blog-artigo-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="vig-selo vig-selo--padrao vig-blog-tag">
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
