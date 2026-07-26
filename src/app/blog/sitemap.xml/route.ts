import { listarPostsBlogPublicos } from '@/lib/blog/acoes'
import { ROTAS } from '@/lib/rotas'
import { obterUrlBaseDoAmbiente } from '@/lib/ambiente'

/** Sitemap para indexação no Google */
export async function GET() {
  const base = obterUrlBaseDoAmbiente('blog')
  const { posts } = await listarPostsBlogPublicos(500)

  const urls = [
    { loc: `${base}${ROTAS.blog.home}`, lastmod: new Date().toISOString() },
    ...posts.map((p) => ({
      loc: `${base}${ROTAS.blog.post(p.slug)}`,
      lastmod: p.atualizado_em,
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod.split('T')[0]}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
