'use client'

import { cn } from '@/lib/utils'

interface OpcaoPill {
  id: string
  rotulo: string
  contagem?: number
}

interface PropsPillsFiltro {
  opcoes: OpcaoPill[]
  ativo: string
  onChange: (id: string) => void
  className?: string
}

/** Navegação em pílulas (Ativos / Rascunhos / etc.) */
export function PillsFiltro({ opcoes, ativo, onChange, className }: PropsPillsFiltro) {
  return (
    <div
      className={cn(
        'inline-flex flex-wrap gap-1 rounded-md border border-border bg-muted/50 p-1',
        className,
      )}
    >
      {opcoes.map((op) => (
        <button
          key={op.id}
          type="button"
          onClick={() => onChange(op.id)}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            ativo === op.id
              ? 'bg-secondary text-secondary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted',
          )}
        >
          {op.rotulo}
          {op.contagem !== undefined && (
            <span className="ml-1.5 text-xs opacity-70">({op.contagem})</span>
          )}
        </button>
      ))}
    </div>
  )
}
