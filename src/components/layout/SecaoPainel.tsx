import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import { RevelarScroll } from '@/components/ui/revelar-scroll'

interface PropsSecaoPainel {
  children: ReactNode
  className?: string
}

/** Container padrão de conteúdo - título fica no CabecalhoPainel */
export function SecaoPainel({ children, className }: PropsSecaoPainel) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
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
}

/** Cartão de seção com estilo unificado */
export function CartaoPainel({ children, className, titulo, descricao, animar = true }: PropsCartaoPainel) {
  const conteudo = (
    <section className={cn('bloco-painel', className)}>
      {(titulo || descricao) && (
        <header className="bloco-painel-cabecalho">
          {titulo && <h2 className="bloco-painel-titulo">{titulo}</h2>}
          {descricao && <p className="bloco-painel-descricao">{descricao}</p>}
        </header>
      )}
      {children}
    </section>
  )

  if (!animar) return conteudo
  return <RevelarScroll>{conteudo}</RevelarScroll>
}
