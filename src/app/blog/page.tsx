import type { Metadata } from 'next'
import Link from 'next/link'
import { obterUrlBaseDoAmbiente } from '@/lib/ambiente'
import { listarPostsBlogPublicos } from '@/lib/blog/acoes'
import { ROTAS } from '@/lib/rotas'

export const metadata: Metadata = {
  title: 'Blog VIGMED',
  description: 'Artigos sobre medicina do trabalho, saúde ocupacional e gestão documental.',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'VIGMED Blog',
  },
}

export default async function PaginaBlogLista() {
  const { posts } = await listarPostsBlogPublicos()

  return (
    <div className="vig-blog-shell min-h-dvh">
      <header className="vig-blog-header">
        <div className="vig-blog-header-inner">
          <Link href={ROTAS.blog.home} className="vig-blog-marca">
            VIGMED <span className="vig-blog-marca-accent">Blog</span>
          </Link>
          <a href={obterUrlBaseDoAmbiente('site')} className="vig-blog-link-site">
            vigmed.com.br
          </a>
        </div>
      </header>

      <main className="vig-blog-main">
        <div className="vig-blog-intro">
          <h1 className="vig-blog-titulo-pagina font-display">Blog VIGMED</h1>
          <p className="vig-blog-subtitulo">
            Conteúdos sobre saúde ocupacional, normas regulamentadoras e uso do portal para empresas.
          </p>
        </div>

        <div className="vig-blog-lista">
          {posts.map((post) => (
            <article key={post.id} className="vig-blog-card group">
              <Link href={ROTAS.blog.post(post.slug)} className="vig-blog-card-link">
                {post.imagem_capa_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.imagem_capa_url}
                    alt=""
                    className="vig-blog-card-capa"
                  />
                )}
                <div className="vig-blog-card-corpo">
                  <time className="vig-blog-data" dateTime={post.publicado_em ?? undefined}>
                    {post.publicado_em
                      ? new Date(post.publicado_em).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : ''}
                  </time>
                  <h2 className="vig-blog-card-titulo">{post.titulo}</h2>
                  {post.resumo && <p className="vig-blog-card-resumo">{post.resumo}</p>}
                  {post.tags?.length > 0 && (
                    <div className="vig-blog-tags">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="vig-selo vig-selo--padrao vig-blog-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </article>
          ))}
          {!posts.length && (
            <div className="vig-vazio vig-vazio--grande vig-blog-vazio">
              <p className="vig-vazio-titulo">Nenhum artigo publicado ainda.</p>
              <p className="vig-vazio-desc">Volte em breve para novidades sobre saúde ocupacional.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="vig-blog-rodape">
        © {new Date().getFullYear()} VIGMED. Todos os direitos reservados.
      </footer>
    </div>
  )
}
