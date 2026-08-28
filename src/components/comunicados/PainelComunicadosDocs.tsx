'use client'

import { useEffect, useRef } from 'react'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { Selo } from '@/components/vig/Selo'
import { Metrica } from '@/components/vig/Metrica'
import { marcarComunicadosLidos, type ComunicadoComLido } from '@/lib/comunicados/acoes'
import { cn, formatarDataHora } from '@/lib/utils'

interface Props {
  comunicados: ComunicadoComLido[]
}

const PRIORIDADE: Record<string, 'erro' | 'alerta' | 'padrao' | 'teal'> = {
  urgente: 'erro',
  alta: 'alerta',
  normal: 'padrao',
  baixa: 'teal',
}

export function PainelComunicadosDocs({ comunicados }: Props) {
  const marcados = useRef(new Set<string>())
  const naoLidos = comunicados.filter((c) => !c.lido).length
  const fixados = comunicados.filter((c) => c.fixado).length

  useEffect(() => {
    const ids = comunicados.filter((c) => !c.lido && !marcados.current.has(c.id)).map((c) => c.id)
    if (ids.length === 0) return
    for (const id of ids) marcados.current.add(id)
    void marcarComunicadosLidos(ids)
  }, [comunicados])

  return (
    <SecaoPainel>
      <CabecalhoPagina
        hero
        rotulo="Portal"
        titulo="Comunicados"
        descricao="Avisos e atualizações publicados pela administração VIGMED."
        icone={<IconeAnimado nome="megaphone" tamanho={28} />}
      />

      <RevelarScroll atraso={0.03}>
        <div className="vig-metrica-grid vig-metrica-grid--3">
          <Metrica rotulo="Total" valor={comunicados.length} icone={<IconeAnimado nome="megaphone" tamanho={16} />} />
          <Metrica rotulo="Não lidos" valor={naoLidos} destaque={naoLidos > 0} icone={<IconeAnimado nome="mail" tamanho={16} />} />
          <Metrica rotulo="Fixados" valor={fixados} icone={<IconeAnimado nome="pin" tamanho={16} />} />
        </div>
      </RevelarScroll>

      <div className="vig-comunicados-lista">
        {comunicados.map((c, i) => (
          <RevelarScroll key={c.id} atraso={i * 0.04}>
            <article
              className={cn(
                'vig-comunicado',
                c.fixado && 'vig-comunicado--fixado',
                !c.lido && 'vig-comunicado--nao-lido',
              )}
            >
              {c.fixado && (
                <div className="vig-comunicado-barra">
                  <IconeAnimado nome="pin" tamanho={12} />
                  Fixado
                </div>
              )}
              <div className="vig-comunicado-corpo">
                <div className="vig-comunicado-topo">
                  <h3>{c.titulo}</h3>
                  <Selo variante={PRIORIDADE[c.prioridade] ?? 'padrao'}>{c.prioridade}</Selo>
                </div>
                <time className="vig-comunicado-data">{formatarDataHora(c.publicado_em)}</time>
                {/<[a-z][\s\S]*>/i.test(c.corpo) ? (
                  <div className="blog-prose vig-comunicado-texto" dangerouslySetInnerHTML={{ __html: c.corpo }} />
                ) : (
                  <p className="vig-comunicado-texto">{c.corpo}</p>
                )}
              </div>
            </article>
          </RevelarScroll>
        ))}

        {comunicados.length === 0 && (
          <RevelarScroll>
            <div className="vig-vazio">
              <IconeAnimado nome="megaphone" tamanho={24} />
              Nenhum comunicado no momento.
            </div>
          </RevelarScroll>
        )}
      </div>
    </SecaoPainel>
  )
}
