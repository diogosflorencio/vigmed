import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  rotulo: string
  valor: ReactNode
  tendencia?: string
  className?: string
  destaque?: boolean
}

/** Indicador com trilha clínica e números em mono */
export function Metrica({ rotulo, valor, tendencia, className, destaque }: Props) {
  return (
    <article
      className={cn(
        'vig-metrica',
        destaque && 'vig-metrica--destaque vig-trilha',
        className,
      )}
    >
      <p className="vig-metrica-rotulo">{rotulo}</p>
      <p className="vig-metrica-valor font-mono tabular-nums">{valor}</p>
      {tendencia && <p className="vig-metrica-tendencia">{tendencia}</p>}
    </article>
  )
}
