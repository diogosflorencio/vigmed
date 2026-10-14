import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  titulo: string
  descricao?: string
  acao?: ReactNode
  compacto?: boolean
  className?: string
}

/** Estado vazio editorial, sem ícones decorativos */
export function Vazio({ titulo, descricao, acao, compacto, className }: Props) {
  return (
    <div
      className={cn(
        'vig-vazio',
        compacto ? 'vig-vazio--compacto' : 'vig-vazio--grande',
        className,
      )}
    >
      <span className="vig-vazio-ornamento" aria-hidden />
      <p className="vig-vazio-titulo">{titulo}</p>
      {descricao && <p className="vig-vazio-desc">{descricao}</p>}
      {acao && <div className="vig-vazio-acao">{acao}</div>}
    </div>
  )
}
