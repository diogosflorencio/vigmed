'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Props {
  titulo: string
  descricao: string
  icone?: ReactNode
  href?: string
  rotuloBotao?: string
  className?: string
}

/** Cartão que vira ao hover ou foco, inspirado em flip-boxes corporativos */
export function FlipBox({
  titulo,
  descricao,
  icone,
  href,
  rotuloBotao = 'Ver mais',
  className,
}: Props) {
  const botao = href ? (
    <Link href={href} className="vig-flip-box-btn" onClick={(e) => e.stopPropagation()}>
      {rotuloBotao}
    </Link>
  ) : null

  return (
    <div className={cn('vig-flip-box', className)} tabIndex={0}>
      <div className="vig-flip-box-inner">
        <div className="vig-flip-box-face vig-flip-box-face--frente">
          {icone && <div className="vig-flip-box-icone">{icone}</div>}
          <h3 className="vig-flip-box-titulo">{titulo}</h3>
        </div>
        <div className="vig-flip-box-face vig-flip-box-face--verso">
          <p className="vig-flip-box-desc">{descricao}</p>
          {botao}
        </div>
      </div>
    </div>
  )
}
