'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { ChipSeletor } from '@/components/vig/ChipSeletor'
import { Metrica } from '@/components/vig/Metrica'
import { Botao } from '@/components/vig/Botao'
import { Vazio } from '@/components/vig/Vazio'
import { Campo } from '@/components/vig/Campo'
import { Selo } from '@/components/vig/Selo'
import { Cartao } from '@/components/vig/Cartao'
import { Confirm } from '@/components/ui/confirmar'
import { alterarStatusPostBlog, excluirPostBlog } from '@/lib/blog/acoes'
import { ROTAS, hrefPublico, urlDoAmbiente } from '@/lib/rotas'
import { formatarDataHora } from '@/lib/utils'
import type { PostBlog } from '@/types'
import type { EstatisticasPostBlog, StatusPostBlog } from '@/lib/blog/tipos'

type Aba = 'todos' | StatusPostBlog

const ROTULO_STATUS: Record<StatusPostBlog, string> = {
  rascunho: 'Rascunho',
  publicado: 'Publicado',
  arquivado: 'Arquivado',
}

interface Props {
  postsIniciais: PostBlog[]
  estatisticas: EstatisticasPostBlog[]
}

export function PainelBlogAdm({ postsIniciais, estatisticas }: Props) {
  const router = useRouter()
  const [aba, definirAba] = useState<Aba>('todos')
  const [busca, definirBusca] = useState('')
  const [pendente, iniciar] = useTransition()
  const [excluirAlvo, definirExcluirAlvo] = useState<{ id: string; titulo: string } | null>(null)

  const mapaStats = useMemo(
    () => new Map(estatisticas.map((e) => [e.postId, e])),
    [estatisticas],
  )

  const posts = useMemo(() => {
    return postsIniciais.filter((p) => {
      if (aba !== 'todos' && p.status !== aba) return false
      if (busca) {
        const q = busca.toLowerCase()
        if (!p.titulo.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [postsIniciais, aba, busca])

  const totais = useMemo(() => {
    const publicados = postsIniciais.filter((p) => p.status === 'publicado')
    const views = postsIniciais.reduce((s, p) => s + (p.total_visualizacoes ?? 0), 0)
    const views7d = estatisticas.reduce((s, e) => s + e.visualizacoes7d, 0)
    return { publicados: publicados.length, views, views7d }
  }, [postsIniciais, estatisticas])

  function pedirExclusao(id: string, titulo: string) {
    definirExcluirAlvo({ id, titulo })
  }

  function confirmarExclusao() {
    if (!excluirAlvo) return
    const { id } = excluirAlvo
    iniciar(async () => {
      const r = await excluirPostBlog(id)
      if (r.erro) toast.error(r.erro)
      else {
        toast.success('Post excluído.')
        router.refresh()
      }
      definirExcluirAlvo(null)
    })
  }

  function arquivar(id: string) {
    iniciar(async () => {
      const r = await alterarStatusPostBlog(id, 'arquivado')
      if (r.erro) toast.error(r.erro)
      else {
        toast.success('Post arquivado.')
        router.refresh()
      }
    })
  }

  return (
    <SecaoPainel>
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <CabecalhoPagina
          rotulo="Conteúdo"
          titulo="Blog"
          descricao="Publicações no site e métricas de leitura."
        />
        <Botao href={hrefPublico(ROTAS.adm.blogNovo)} variante="primario" tamanho="sm" filho="Novo post" />
      </div>

      <div className="vig-metrica-grid vig-metrica-grid--3">
        <Metrica rotulo="Posts publicados" valor={totais.publicados} />
        <Metrica rotulo="Visualizações totais" valor={totais.views.toLocaleString('pt-BR')} />
        <Metrica rotulo="Últimos 7 dias" valor={totais.views7d.toLocaleString('pt-BR')} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end justify-between">
        <ChipSeletor
          opcoes={[
            { id: 'todos', rotulo: 'Todos' },
            { id: 'publicado', rotulo: 'Publicados' },
            { id: 'rascunho', rotulo: 'Rascunhos' },
            { id: 'arquivado', rotulo: 'Arquivados' },
          ]}
          valor={aba}
          aoMudar={(id) => definirAba(id as Aba)}
        />
        <Campo
          placeholder="Buscar posts..."
          value={busca}
          onChange={(e) => definirBusca(e.target.value)}
          prefixo={<Search size={16} />}
          className="max-w-md"
        />
      </div>

      <div className="flex flex-col gap-3">
        {posts.map((post) => {
          const stats = mapaStats.get(post.id)
          return (
            <Cartao key={post.id} className="overflow-hidden">
              <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                {post.imagem_capa_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.imagem_capa_url}
                    alt=""
                    className="w-full md:w-28 h-20 object-cover rounded-lg shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{post.titulo}</h3>
                    <Selo variante={post.status === 'publicado' ? 'sucesso' : post.status === 'arquivado' ? 'padrao' : 'info'}>
                      {ROTULO_STATUS[post.status]}
                    </Selo>
                  </div>
                  <p className="text-xs text-[var(--color-text-3)] truncate">/{post.slug}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-[var(--color-text-3)]">
                    <span>Atualizado {formatarDataHora(post.atualizado_em)}</span>
                    {post.publicado_em && <span>Publicado {formatarDataHora(post.publicado_em)}</span>}
                    <span>
                      {post.total_visualizacoes ?? 0} views
                      {stats && stats.visualizacoes7d > 0 && ` · ${stats.visualizacoes7d} (7d)`}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {post.status === 'publicado' && (
                    <a
                      href={urlDoAmbiente('blog', ROTAS.blog.post(post.slug))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-7 items-center gap-1 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-button-bg)] px-2.5 text-[0.8rem] font-medium hover:bg-[var(--glass-nav-hover)]"
                    >
                      Ver
                    </a>
                  )}
                  <Link
                    href={hrefPublico(ROTAS.adm.blogEditar(post.id))}
                    className="inline-flex h-7 items-center gap-1 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-button-bg)] px-2.5 text-[0.8rem] font-medium hover:bg-[var(--glass-nav-hover)]"
                  >
                    Editar
                  </Link>
                  {post.status !== 'arquivado' && (
                    <Botao variante="fantasma" tamanho="sm" disabled={pendente} onClick={() => arquivar(post.id)} filho="Arquivar" />
                  )}
                  <Botao
                    variante="fantasma"
                    tamanho="sm"
                    className="text-[#b42318]"
                    disabled={pendente}
                    onClick={() => pedirExclusao(post.id, post.titulo)}
                  >
                    Excluir
                  </Botao>
                </div>
              </div>
            </Cartao>
          )
        })}
        {!posts.length && (
          <Vazio titulo="Nenhum post encontrado" descricao="Crie um artigo ou ajuste a busca." compacto />
        )}
      </div>

      <Confirm
        open={!!excluirAlvo}
        onClose={() => definirExcluirAlvo(null)}
        onConfirm={confirmarExclusao}
        title="Excluir post"
        message={excluirAlvo ? `Excluir "${excluirAlvo.titulo}"? Esta ação não pode ser desfeita.` : ''}
        confirmLabel="Excluir"
        loading={pendente}
      />
    </SecaoPainel>
  )
}
