'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export type TomFlipBox =
  | 'navy'
  | 'teal'
  | 'teal-escuro'
  | 'slate'
  | 'cyan'
  | 'ocean'
  | 'claro'

interface Props {
  titulo: string
  descricao: string
  icone?: ReactNode
  href?: string
  rotuloBotao?: string
  className?: string
  tom?: TomFlipBox
}

/** Cartão que vira ao hover, foco ou toque (estilo grade de serviços corporativos). */
export function FlipBox({
  titulo,
  descricao,
  icone,
  href,
  rotuloBotao = 'Saiba mais',
  className,
  tom = 'claro',
}: Props) {
  const [virado, definirVirado] = useState(false)

  const botao = href ? (
    <Link
      href={href}
      className="vig-flip-box-btn"
      onClick={(e) => e.stopPropagation()}
    >
      {rotuloBotao}
    </Link>
  ) : (
    <span className="vig-flip-box-btn vig-flip-box-btn--estatico">{rotuloBotao}</span>
  )

  return (
    <div
      className={cn(
        'vig-flip-box',
        `vig-flip-box--${tom}`,
        virado && 'vig-flip-box--virado',
        className,
      )}
      tabIndex={0}
      role="button"
      aria-label={`${titulo}. ${descricao}`}
      onClick={() => definirVirado((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          definirVirado((v) => !v)
        }
      }}
      onBlur={() => definirVirado(false)}
    >
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
