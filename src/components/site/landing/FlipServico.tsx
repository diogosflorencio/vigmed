'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tom = 'navy' | 'teal' | 'deep' | 'slate' | 'cyan' | 'ocean'

interface Props {
  titulo: string
  descricao: string
  icone: ReactNode
  tom: Tom
  href?: string
}

export function FlipServico({ titulo, descricao, icone, tom, href = '#contato' }: Props) {
  const [virado, setVirado] = useState(false)

  return (
    <button
      type="button"
      className={cn('vm-flip', `vm-flip--${tom}`, virado && 'is-flipped')}
      aria-label={`${titulo}. ${descricao}`}
      onClick={() => setVirado((v) => !v)}
      onBlur={() => setVirado(false)}
    >
      <div className="vm-flip-inner">
        <div className="vm-flip-face vm-flip-face--front">
          <span className="vm-flip-ico" aria-hidden>
            {icone}
          </span>
          <h3 className="vm-flip-titulo">{titulo}</h3>
        </div>
        <div className="vm-flip-face vm-flip-face--back">
          <p className="vm-flip-desc">{descricao}</p>
          <a
            className="vm-flip-cta"
            href={href}
            onClick={(e) => e.stopPropagation()}
          >
            Saiba mais
          </a>
        </div>
      </div>
    </button>
  )
}
