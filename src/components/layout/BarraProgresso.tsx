import { cn } from '@/lib/utils'

interface PropsBarraProgresso {
  valor: number
  maximo: number
  rotulo?: string
  valorFormatado?: string
  limiteFormatado?: string
  alerta?: boolean
  compacto?: boolean
  className?: string
}

/** Barra de progresso para armazenamento */
export function BarraProgresso({
  valor,
  maximo,
  rotulo = 'Armazenamento',
  valorFormatado,
  limiteFormatado,
  alerta,
  compacto,
  className,
}: PropsBarraProgresso) {
  const pct = maximo > 0 ? Math.min(100, (valor / maximo) * 100) : 0
  const critico = alerta ?? pct >= 90

  return (
    <div className={cn(compacto ? 'space-y-1' : 'space-y-2', className)}>
      {!compacto && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{rotulo}</span>
          {(valorFormatado || limiteFormatado) && (
            <span className={cn('font-mono tabular-nums', critico && 'text-destructive font-medium')}>
              {valorFormatado} / {limiteFormatado}
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-muted', compacto ? 'h-1' : 'h-1.5')}>
        <div
          className={cn('h-full rounded-full transition-all', critico ? 'bg-destructive' : 'bg-primary')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
