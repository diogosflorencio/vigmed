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

/** Cabeçalho editorial da página, alinhado ao ritmo visual do painel */
export function PaginaHero({ rotulo, titulo, descricao, acoes, className, compacto }: Props) {
  return (
    <RevelarScroll>
      <header
        className={cn(
          'vig-pagina-hero vig-trilha vig-trilha--hero vm-page-head vm-page-head--hero',
          compacto && 'vig-pagina-hero--compacto',
          className,
        )}
      >
        <div className="vig-pagina-hero-texto vm-page-head-main">
          {rotulo && <p className="vig-landing-kicker vm-page-head-kicker">{rotulo}</p>}
          <h1 className="vm-page-head-titulo">{titulo}</h1>
          {descricao && <p className="vm-page-head-texto">{descricao}</p>}
        </div>
        {acoes && <div className="vig-pagina-hero-acoes vm-page-head-acoes">{acoes}</div>}
      </header>
    </RevelarScroll>
  )
}
