'use client'

import { IconeAnimado } from '@/components/ui/icone-animado'
import { usePaletaComando } from '@/contexts/PaletaComandoContext'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
  compacto?: boolean
}

/** Botão que abre a paleta Ctrl+K */
export function BotaoPaletaComando({ className, compacto }: Props) {
  const { abrir } = usePaletaComando()

  return (
    <button
      type="button"
      className={cn('menu-paleta-trigger', compacto && 'menu-paleta-trigger--compacto', className)}
      onClick={abrir}
      aria-label="Abrir paleta de navegação (Ctrl+K)"
    >
      <IconeAnimado nome="search" tamanho={14} />
      {!compacto && <span className="hidden sm:inline">Ir para...</span>}
      <kbd className="menu-paleta-atalho">Ctrl K</kbd>
    </button>
  )
}
