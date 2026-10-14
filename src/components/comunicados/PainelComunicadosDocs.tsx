'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAtalhoBusca } from '@/hooks/use-atalho-busca'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { Vazio } from '@/components/vig/Vazio'
import { useNotificacoesPortal } from '@/contexts/NotificacoesPortalContext'
import { marcarComunicadoLido, type ComunicadoComLido } from '@/lib/comunicados/acoes'
import { cn, formatarDataHora } from '@/lib/utils'

interface Props {
  comunicados: ComunicadoComLido[]
}

function rotuloPrioridade(p: string) {
  if (p === 'urgente') return 'Urgente'
  if (p === 'alta') return 'Alta'
  if (p === 'baixa') return 'Baixa'
  return 'Normal'
}

function ComunicadoItem({
  comunicado,
  destacado,
  onLido,
}: {
  comunicado: ComunicadoComLido
  destacado: boolean
  onLido: (id: string) => void
}) {
  const ref = useRef<HTMLElement>(null)
  const marcado = useRef(false)

  useEffect(() => {
    if (destacado && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [destacado])

  useEffect(() => {
    if (comunicado.lido || marcado.current) return
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !marcado.current) {
          marcado.current = true
          onLido(comunicado.id)
        }
      },
      { threshold: 0.35 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [comunicado.id, comunicado.lido, onLido])

  return (
    <article
      ref={ref}
      id={`comunicado-${comunicado.id}`}
      className={cn(
        'com-leitura',
        comunicado.fixado && 'com-leitura--fixado',
        !comunicado.lido && 'com-leitura--novo',
        destacado && 'com-leitura--destacada',
      )}
    >
      <header className="com-leitura-cabeca">
        <div className="com-leitura-titulos">
          <h3>{comunicado.titulo}</h3>
          <p>
            {formatarDataHora(comunicado.publicado_em)}
            {comunicado.fixado ? ' · Fixado' : ''}
            {!comunicado.lido ? ' · Não lido' : ''}
          </p>
        </div>
        <span className={cn('com-prio', `com-prio--${comunicado.prioridade}`)}>
          {rotuloPrioridade(comunicado.prioridade)}
        </span>
      </header>
      {/<[a-z][\s\S]*>/i.test(comunicado.corpo) ? (
        <div
          className="com-leitura-corpo blog-prose"
          dangerouslySetInnerHTML={{ __html: comunicado.corpo }}
        />
      ) : (
        <p className="com-leitura-corpo">{comunicado.corpo}</p>
      )}
    </article>
  )
}

export function PainelComunicadosDocs({ comunicados: comunicadosIniciais }: Props) {
  const searchParams = useSearchParams()
  const { atualizar: atualizarNotificacoes } = useNotificacoesPortal()
  const [comunicados, definirComunicados] = useState(comunicadosIniciais)
  const [busca, definirBusca] = useState('')
  const [filtro, definirFiltro] = useState<'todos' | 'nao-lidos'>('todos')
  const [destacadoId, definirDestacadoId] = useState<string | null>(null)
  const buscaRef = useRef<HTMLInputElement>(null)

  useAtalhoBusca(buscaRef)

  useEffect(() => {
    definirComunicados(comunicadosIniciais)
  }, [comunicadosIniciais])

  useEffect(() => {
    const paramFiltro = searchParams.get('filtro')
    if (paramFiltro === 'nao-lidos') definirFiltro('nao-lidos')

    const id = searchParams.get('comunicado')
    if (id && comunicadosIniciais.some((c) => c.id === id)) {
      definirDestacadoId(id)
    }
  }, [searchParams, comunicadosIniciais])

  const marcarLido = useCallback(
    (id: string) => {
      definirComunicados((lista) =>
        lista.map((c) => (c.id === id ? { ...c, lido: true } : c)),
      )
      void marcarComunicadoLido(id).then(() => {
        void atualizarNotificacoes()
      })
    },
    [atualizarNotificacoes],
  )

  const filtrados = useMemo(() => {
    return comunicados.filter((c) => {
      if (filtro === 'nao-lidos' && c.lido) return false
      if (busca.trim()) {
        const termo = busca.trim().toLowerCase()
        return c.titulo.toLowerCase().includes(termo)
      }
      return true
    })
  }, [comunicados, busca, filtro])

  const naoLidos = comunicados.filter((c) => !c.lido).length

  return (
    <SecaoPainel className="com-pagina">
      <CabecalhoPagina
        rotulo="Portal"
        titulo="Comunicados"
        descricao="Avisos da administração VIGMED."
      />

      <RevelarScroll atraso={0.03}>
        <section className="com-bloco">
          <div className="com-bloco-cabeca com-bloco-cabeca--linha">
            <div>
              <h2 className="com-bloco-titulo">Avisos</h2>
              <p className="com-bloco-desc">
                {filtrados.length} de {comunicados.length}
                {naoLidos > 0 ? ` · ${naoLidos} não lido${naoLidos === 1 ? '' : 's'}` : ''}
              </p>
            </div>
          </div>

          <div className="com-filtros">
            <input
              ref={buscaRef}
              className="com-filtro com-filtro--busca"
              placeholder="Buscar…"
              value={busca}
              onChange={(e) => definirBusca(e.target.value)}
              aria-label="Buscar comunicados"
            />
            <select
              className="com-filtro"
              value={filtro}
              onChange={(e) => definirFiltro(e.target.value as typeof filtro)}
              aria-label="Filtro de leitura"
            >
              <option value="todos">Todos</option>
              <option value="nao-lidos">Não lidos{naoLidos > 0 ? ` (${naoLidos})` : ''}</option>
            </select>
          </div>

          <div className="com-feed">
            {filtrados.map((c) => (
              <ComunicadoItem
                key={c.id}
                comunicado={c}
                destacado={destacadoId === c.id}
                onLido={marcarLido}
              />
            ))}

            {filtrados.length === 0 && (
              <Vazio
                titulo={
                  busca.trim() || filtro === 'nao-lidos'
                    ? 'Nenhum comunicado encontrado'
                    : 'Nenhum comunicado no momento'
                }
                descricao={
                  busca.trim()
                    ? 'Tente outro termo.'
                    : filtro === 'nao-lidos'
                      ? 'Você leu todos os avisos.'
                      : 'Quando houver avisos, eles aparecem aqui.'
                }
                compacto
              />
            )}
          </div>
        </section>
      </RevelarScroll>
    </SecaoPainel>
  )
}
