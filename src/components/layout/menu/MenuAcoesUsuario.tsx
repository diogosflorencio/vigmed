'use client'

import { IconeAnimado } from '@/components/ui/icone-animado'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { PipulaDock } from '@/components/layout/menu/PipulaDock'
import { sair } from '@/lib/auth/acoes'
import { useTheme } from '@/contexts/ThemeContext'
import type { AmbienteApp } from '@/lib/ambiente'
import type { Perfil } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  ambiente: AmbienteApp
  perfil: Perfil
  compacto?: boolean
  noDock?: boolean
  mobileComRotulo?: boolean
  className?: string
}

/** Tema + sair reutilizados em todas as variantes */
export function MenuAcoesUsuario({ perfil, compacto, noDock, mobileComRotulo, className }: Props) {
  const { tema } = useTheme()
  const rotuloTema = tema === 'dark' ? 'Tema claro' : 'Tema escuro'

  return (
    <div className={cn('menu-acoes-usuario', noDock && 'menu-acoes-usuario--dock', className)}>
      {!compacto && (
        <div className="menu-acoes-usuario-info">
          <p className="menu-acoes-usuario-nome">{perfil.nome_completo}</p>
          <p className="menu-acoes-usuario-email">{perfil.email}</p>
        </div>
      )}
      <div className="menu-acoes-usuario-botoes">
        {noDock ? (
          <>
            {mobileComRotulo ? (
              <>
                <div className="menu-dock-item menu-dock-item--com-rotulo">
                  <ThemeToggle className="menu-acoes-btn menu-acoes-btn--dock menu-acoes-btn--mobile-rotulo" />
                  <span className="menu-dock-item-rotulo">{rotuloTema}</span>
                </div>
                <button
                  type="button"
                  className="menu-dock-item menu-dock-item--com-rotulo"
                  onClick={() => sair()}
                  aria-label="Sair"
                >
                  <span className="menu-dock-item-icone">
                    <IconeAnimado nome="logout" tamanho={18} />
                  </span>
                  <span className="menu-dock-item-rotulo">Sair</span>
                </button>
              </>
            ) : (
              <>
            <PipulaDock texto={rotuloTema}>
              {(pipula) => (
                <ThemeToggle
                  className="menu-acoes-btn menu-acoes-btn--dock"
                  ref={pipula.ref as (node: HTMLButtonElement | null) => void}
                  onMouseEnter={pipula.onMouseEnter}
                  onMouseLeave={pipula.onMouseLeave}
                  onFocus={pipula.onFocus}
                  onBlur={pipula.onBlur}
                />
              )}
            </PipulaDock>
            <PipulaDock texto="Sair">
              {(pipula) => (
                <button
                  type="button"
                  className="menu-acoes-btn menu-acoes-btn--dock"
                  onClick={() => sair()}
                  aria-label="Sair"
                  ref={pipula.ref as (node: HTMLButtonElement | null) => void}
                  onMouseEnter={pipula.onMouseEnter}
                  onMouseLeave={pipula.onMouseLeave}
                  onFocus={pipula.onFocus}
                  onBlur={pipula.onBlur}
                >
                  <IconeAnimado nome="logout" tamanho={18} />
                </button>
              )}
            </PipulaDock>
              </>
            )}
          </>
        ) : (
          <>
            <ThemeToggle className="menu-acoes-btn" />
            <button type="button" className="menu-acoes-btn" onClick={() => sair()}>
              <IconeAnimado nome="logout" tamanho={14} />
              {!compacto && <span>Sair</span>}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
