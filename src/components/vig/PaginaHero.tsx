import type { ReactNode } from 'react'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { cn } from '@/lib/utils'

interface Props {
  rotulo?: string
  titulo: string
  descricao?: string
  icone?: ReactNode
  acoes?: ReactNode
  className?: string
  compacto?: boolean
}

/** Cabeçalho hero das páginas internas */
export function PaginaHero({ rotulo, titulo, descricao, icone, acoes, className, compacto }: Props) {
  return (
    <RevelarScroll>
      <header className={cn('vig-pagina-hero', compacto && 'vig-pagina-hero--compacto', className)}>
        <div className="vig-pagina-hero-texto">
          {rotulo && <p className="vig-landing-kicker">{rotulo}</p>}
          <h1>{titulo}</h1>
          {descricao && <p>{descricao}</p>}
        </div>
        {icone && <div className="vig-pagina-hero-icone">{icone}</div>}
        {acoes && <div className="vig-pagina-hero-acoes">{acoes}</div>}
      </header>
    </RevelarScroll>
  )
}
