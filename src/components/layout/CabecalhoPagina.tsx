'use client'

import type { ReactNode } from 'react'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { cn } from '@/lib/utils'

interface PropsCabecalhoPagina {
  titulo: string
  descricao?: string
  rotulo?: string
  acoes?: ReactNode
  className?: string
}

/** Identificação da página com animação suave ao entrar */
export function CabecalhoPagina({ titulo, descricao, rotulo, acoes, className }: PropsCabecalhoPagina) {
  return (
    <RevelarScroll>
      <header className={cn('page-heading', className)}>
        <div>
          {rotulo && <p className="page-heading-kicker">{rotulo}</p>}
          <h1 className="page-heading-title">{titulo}</h1>
          {descricao && <p className="page-heading-description">{descricao}</p>}
        </div>
        {acoes && <div className="page-heading-actions">{acoes}</div>}
      </header>
    </RevelarScroll>
  )
}
