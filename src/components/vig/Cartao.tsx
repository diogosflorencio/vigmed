import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  titulo?: string
  descricao?: string
  children: ReactNode
  className?: string
  destaque?: boolean
}

/** Superfície operacional do painel, plana e com hierarquia clara */
export function Cartao({ titulo, descricao, children, className, destaque }: Props) {
  return (
    <article className={cn('vig-card vm-card', destaque && 'vig-card--destaque', className)}>
      {(titulo || descricao) && (
        <header className="vig-card-cabecalho vm-card-cabecalho">
          {titulo && <h3>{titulo}</h3>}
          {descricao && <p>{descricao}</p>}
        </header>
      )}
      {children}
    </article>
  )
}
