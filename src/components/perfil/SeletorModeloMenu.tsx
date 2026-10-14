'use client'

import { useTheme } from '@/contexts/ThemeContext'
import type { ModeloMenu } from '@/lib/tema/tipos'
import { cn } from '@/lib/utils'

const MODELOS: { id: ModeloMenu; rotulo: string }[] = [
  { id: 'dock', rotulo: 'Inferior' },
  { id: 'lateral', rotulo: 'Esquerda' },
  { id: 'direita', rotulo: 'Direita' },
  { id: 'superior', rotulo: 'Superior' },
]

interface Props {
  className?: string
}

/** Seletor compacto do layout de navegação */
export function SeletorModeloMenu({ className }: Props) {
  const { modeloMenu, definirModeloMenu } = useTheme()

  return (
    <div className={cn('vig-menu-preview-grid', className)} role="group" aria-label="Modelo do menu">
      {MODELOS.map((m) => {
        const ativo = modeloMenu === m.id
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => definirModeloMenu(m.id)}
            aria-pressed={ativo}
            className={cn('vig-menu-preview-card', ativo && 'vig-menu-preview-card--ativo')}
          >
            <div className={cn('vig-menu-preview-mini', `vig-menu-preview-mini--${m.id}`)} aria-hidden>
              <span className="vig-menu-preview-mini-barra" />
              <span className="vig-menu-preview-mini-area" />
            </div>
            <div className="vig-menu-preview-texto">
              <strong>{m.rotulo}</strong>
            </div>
          </button>
        )
      })}
    </div>
  )
}
