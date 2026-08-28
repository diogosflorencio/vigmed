'use client'

import { useTheme } from '@/contexts/ThemeContext'
import type { ModeloMenu } from '@/lib/tema/tipos'
import { cn } from '@/lib/utils'

const MODELOS: { id: ModeloMenu; rotulo: string; descricao: string }[] = [
  {
    id: 'dock',
    rotulo: 'Dock inferior',
    descricao: 'Navegação flutuante na parte de baixo, ideal para telas largas e uso rápido.',
  },
  {
    id: 'lateral',
    rotulo: 'Barra lateral',
    descricao: 'Menu fixo à esquerda com todos os itens visíveis, estilo clássico de dashboard.',
  },
  {
    id: 'superior',
    rotulo: 'Menu superior',
    descricao: 'Barra horizontal no topo com dropdowns, mais espaço vertical para o conteúdo.',
  },
]

interface Props {
  className?: string
}

/** Seletor visual do layout de navegação com mini-previews */
export function SeletorModeloMenu({ className }: Props) {
  const { modeloMenu, definirModeloMenu } = useTheme()

  return (
    <div className={cn('vig-menu-preview-grid', className)}>
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
              <span>{m.descricao}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
