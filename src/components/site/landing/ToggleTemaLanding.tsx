'use client'

import { Moon, Sun } from '@phosphor-icons/react'

interface Props {
  claro: boolean
  onToggle: () => void
}

/** Alterna tema claro/escuro da landing. */
export function ToggleTemaLanding({ claro, onToggle }: Props) {
  return (
    <button
      type="button"
      className="vm-tema-btn"
      onClick={onToggle}
      aria-label={claro ? 'Ativar tema escuro' : 'Ativar tema claro'}
      title={claro ? 'Tema escuro' : 'Tema claro'}
    >
      {claro ? <Moon size={16} weight="bold" /> : <Sun size={16} weight="bold" />}
    </button>
  )
}
