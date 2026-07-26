'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { REGISTRO_TEMAS } from '@/lib/tema/definicoes'
import type { IdTemaVisual } from '@/lib/tema/tipos'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

/** Seletor de tema, mesmo padrão visual do modo claro/escuro */
export function SeletorTemaVisual({ className }: Props) {
  const { temaVisual, definirTemaVisual } = useTheme()

  return (
    <div
      className={cn(
        'inline-flex flex-wrap gap-1 rounded-full border border-border bg-muted/30 p-1',
        className,
      )}
    >
      {REGISTRO_TEMAS.map((tema) => {
        const ativo = temaVisual === tema.id
        const cor = tema.preview[1]

        return (
          <button
            key={tema.id}
            type="button"
            onClick={() => definirTemaVisual(tema.id as IdTemaVisual)}
            aria-pressed={ativo}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-all duration-300',
              ativo
                ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80',
            )}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full ring-1 ring-black/10"
              style={{ backgroundColor: cor }}
              aria-hidden
            />
            {tema.rotulo}
          </button>
        )
      })}
    </div>
  )
}
