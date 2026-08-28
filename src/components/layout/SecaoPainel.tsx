import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { Cartao } from '@/components/vig/Cartao'

interface PropsSecaoPainel {
  children: ReactNode
  className?: string
}

/** Container padrão de conteúdo do painel */
export function SecaoPainel({ children, className }: PropsSecaoPainel) {
  return (
    <div className={cn('vig-secao-painel flex flex-col gap-4', className)}>
      {children}
    </div>
  )
}

interface PropsCartaoPainel {
  children: ReactNode
  className?: string
  titulo?: string
  descricao?: string
  animar?: boolean
  destaque?: boolean
}

/** Cartão de seção, delega ao componente VIGMED */
export function CartaoPainel({
  children,
  className,
  titulo,
  descricao,
  animar = true,
  destaque,
}: PropsCartaoPainel) {
  const conteudo = (
    <Cartao titulo={titulo} descricao={descricao} className={className} destaque={destaque}>
      {children}
    </Cartao>
  )

  if (!animar) return conteudo
  return <RevelarScroll>{conteudo}</RevelarScroll>
}
