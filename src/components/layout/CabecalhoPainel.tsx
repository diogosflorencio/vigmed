'use client'

import { ThemeToggle } from '@/components/layout/ThemeToggle'
import type { AmbienteApp } from '@/lib/ambiente'

interface PropsCabecalho {
  ambiente: AmbienteApp
  rotuloPagina: string
}

/** Cabeçalho discreto do painel - desktop */
export function CabecalhoPainel({ ambiente, rotuloPagina }: PropsCabecalho) {
  const nomeApp = ambiente === 'adm' ? 'Administração' : 'Portal'

  return (
    <header className="hidden md:flex items-center justify-between shrink-0 px-1 py-2 rounded-2xl glass-apple">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-3)]">
          VIGMED · {nomeApp}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-1)] mt-0.5">
          {rotuloPagina}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  )
}
