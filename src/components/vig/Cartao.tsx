import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  titulo?: string
  descricao?: string
  children: ReactNode
  className?: string
  destaque?: boolean
}

/** Cartão com bordas suaves e sombra da identidade VIGMED */
export function Cartao({ titulo, descricao, children, className, destaque }: Props) {
  return (
    <article
      className={cn(
        'vig-card rounded-2xl border bg-[var(--color-surface)] p-5 transition-shadow duration-300',
        destaque
          ? 'border-[var(--vig-teal)]/30 shadow-[0_12px_40px_rgba(13,148,136,0.12)]'
          : 'border-[var(--color-border)] shadow-[0_4px_24px_rgba(15,39,68,0.06)] hover:shadow-[0_8px_32px_rgba(15,39,68,0.1)]',
        className,
      )}
    >
      {(titulo || descricao) && (
        <header className="mb-4 pb-3 border-b border-[var(--color-border)]">
          {titulo && <h3 className="text-base font-semibold text-[var(--vig-navy)]">{titulo}</h3>}
          {descricao && <p className="mt-1 text-xs text-[var(--color-text-3)]">{descricao}</p>}
        </header>
      )}
      {children}
    </article>
  )
}
