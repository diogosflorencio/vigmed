import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  rotulo: string
  valor: ReactNode
  icone?: ReactNode
  tendencia?: string
  className?: string
  destaque?: boolean
}

/** Cartão de métrica reutilizável nos painéis */
export function Metrica({ rotulo, valor, icone, tendencia, className, destaque }: Props) {
  return (
    <article className={cn('vig-metrica', destaque && 'vig-metrica--destaque', className)}>
      {icone && <div className="vig-metrica-icone">{icone}</div>}
      <p className="vig-metrica-valor">{valor}</p>
      <p className="vig-metrica-rotulo">{rotulo}</p>
      {tendencia && <p className="vig-metrica-tendencia">{tendencia}</p>}
    </article>
  )
}
