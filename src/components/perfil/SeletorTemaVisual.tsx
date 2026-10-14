'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { REGISTRO_TEMAS } from '@/lib/tema/definicoes'
import type { IdTemaVisual } from '@/lib/tema/tipos'
import { ChipSeletor } from '@/components/vig/ChipSeletor'

interface Props {
  className?: string
}

/** Seletor de tema visual com chips da identidade VIGMED */
export function SeletorTemaVisual({ className }: Props) {
  const { temaVisual, definirTemaVisual } = useTheme()

  return (
    <ChipSeletor
      className={className}
      valor={temaVisual}
      aoMudar={(id) => definirTemaVisual(id as IdTemaVisual)}
      opcoes={REGISTRO_TEMAS.map((tema) => ({
        id: tema.id,
        rotulo: tema.rotulo,
        preview: (
          <span
            className="h-2 w-2 shrink-0 rounded-full ring-1 ring-black/10"
            style={{ backgroundColor: tema.preview[1] }}
            aria-hidden
          />
        ),
      }))}
    />
  )
}
