import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PropsCartaoMetrica {
  titulo: string
  valor: string | number
  descricao?: string
  icone?: ReactNode
  badge?: ReactNode
  indicador?: ReactNode
  className?: string
  onClick?: () => void
}

export function CartaoMetrica({
  titulo,
  valor,
  descricao,
  icone,
  badge,
  indicador,
  className,
  onClick,
}: PropsCartaoMetrica) {
  return (
    <div
      className={cn('metrica-card', onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      {icone && <div className="metrica-icone">{icone}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="metrica-valor">{valor}</p>
        <p className="metrica-titulo">{titulo}</p>
        {descricao && <p style={{ fontSize: '0.7rem', color: 'var(--color-text-3)', marginTop: '0.1rem' }}>{descricao}</p>}
      </div>
      {(badge || indicador) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          {badge}
          {indicador}
        </div>
      )}
    </div>
  )
}
