'use client'

import type { ReactNode } from 'react'
import { PaginaHero } from '@/components/vig/PaginaHero'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { cn } from '@/lib/utils'

interface PropsCabecalhoPagina {
  titulo: string
  descricao?: string
  rotulo?: string
  icone?: ReactNode
  acoes?: ReactNode
  className?: string
  /** Usa banner hero VIGMED em vez do heading simples */
  hero?: boolean
}

/** Identificação da página, heading simples ou hero VIGMED */
export function CabecalhoPagina({
  titulo,
  descricao,
  rotulo,
  icone,
  acoes,
  className,
  hero = false,
}: PropsCabecalhoPagina) {
  if (hero) {
    return (
      <PaginaHero
        rotulo={rotulo}
        titulo={titulo}
        descricao={descricao}
        icone={icone}
        acoes={acoes}
        className={className}
      />
    )
  }

  return (
    <RevelarScroll>
      <header className={cn('vig-page-heading', className)}>
        <div className="vig-page-heading-main">
          {rotulo && <p className="vig-landing-kicker">{rotulo}</p>}
          <h1>{titulo}</h1>
          {descricao && <p>{descricao}</p>}
        </div>
        {acoes && <div className="vig-page-heading-acoes">{acoes}</div>}
      </header>
    </RevelarScroll>
  )
}
