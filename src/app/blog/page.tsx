import type { Metadata } from 'next'
import Link from 'next/link'
import { obterUrlBaseDoAmbiente } from '@/lib/ambiente'
import { listarPostsBlogPublicos } from '@/lib/blog/acoes'
import { ROTAS } from '@/lib/rotas'

export const metadata: Metadata = {
  title: 'Blog VIGMED - Artigos sobre gestão documental e compliance',
  description:
    'Artigos, novidades e conteúdos da VIGMED sobre gestão segura de documentos corporativos, compliance e boas práticas.',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'VIGMED Blog',
  },
}

export default async function PaginaBlogLista() {
  const { posts } = await listarPostsBlogPublicos()

  return (
    <div className="min-h-dvh">
      <header className="border-b border-[var(--glass-border)] glass-apple sticky top-0 z-30">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Link href={ROTAS.blog.home} className="font-bold text-lg tracking-tight text-[var(--color-text-1)]">
            VIGMED <span className="text-primary font-normal">Blog</span>
          </Link>
          <a
            href={obterUrlBaseDoAmbiente('site')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            vigmed.com.br
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text-1)]">
            Insights em gestão documental
          </h1>
          <p className="mt-3 text-lg text-[var(--color-text-2)] max-w-2xl">
            Conteúdos da equipe VIGMED sobre segurança da informação, compliance e produtividade corporativa.
          </p>
        </div>

        <div className="grid gap-6">
          {posts.map((post) => (
            <article key={post.id} className="surface-card overflow-hidden group">
              <Link href={ROTAS.blog.post(post.slug)} className="flex flex-col sm:flex-row gap-0 sm:gap-4">
                {post.imagem_capa_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.imagem_capa_url}
                    alt=""
                    className="sm:w-48 h-40 sm:h-auto object-cover shrink-0"
                  />
                )}
                <div className="p-5 flex flex-col gap-2">
                  <time className="text-xs text-muted-foreground" dateTime={post.publicado_em ?? undefined}>
                    {post.publicado_em
                      ? new Date(post.publicado_em).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : ''}
                  </time>
                  <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">{post.titulo}</h2>
                  {post.resumo && <p className="text-sm text-[var(--color-text-2)] line-clamp-2">{post.resumo}</p>}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--glass-nav-active)] text-[var(--color-text-2)]"
                        >
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
            <div className="surface-card p-12 text-center text-muted-foreground">
              Em breve novos artigos.
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-[var(--glass-border)] mt-16 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} VIGMED. Todos os direitos reservados.
      </footer>
    </div>
  )
}
