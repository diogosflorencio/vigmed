'use client'

import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { cn } from '@/lib/utils'

interface Props {
  aberto: boolean
  onFechar: () => void
  titulo?: string
  descricao?: string
  children: ReactNode
  rodape?: ReactNode
  className?: string
  largo?: boolean
}

/** Modal padrão VIGMED */
export function Modal({
  aberto,
  onFechar,
  titulo,
  descricao,
  children,
  rodape,
  className,
  largo,
}: Props) {
  useEffect(() => {
    if (!aberto) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const aoTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    window.addEventListener('keydown', aoTecla)
    return () => {
      document.body.style.overflow = anterior
      window.removeEventListener('keydown', aoTecla)
    }
  }, [aberto, onFechar])

  if (!aberto || typeof document === 'undefined') return null

  return createPortal(
    <div className="vig-modal-overlay" onClick={onFechar} role="presentation">
      <div
        className={cn('vig-modal', largo && 'vig-modal--largo', className)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titulo ? 'vig-modal-titulo' : undefined}
      >
        {(titulo || descricao) && (
          <header className="vig-modal-cabecalho">
            <div>
              {titulo && (
                <h2 id="vig-modal-titulo" className="vig-modal-titulo">
                  {titulo}
                </h2>
              )}
              {descricao && <p className="vig-modal-descricao">{descricao}</p>}
            </div>
            <button type="button" className="vig-modal-fechar" onClick={onFechar} aria-label="Fechar">
              <IconeAnimado nome="x" tamanho={16} />
            </button>
          </header>
        )}
        <div className="vig-modal-corpo">{children}</div>
        {rodape && <footer className="vig-modal-rodape">{rodape}</footer>}
      </div>
    </div>,
    document.body,
  )
}
