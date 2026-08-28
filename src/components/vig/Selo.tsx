import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type VarianteSelo =
  | 'padrao'
  | 'sucesso'
  | 'alerta'
  | 'erro'
  | 'teal'
  | 'navy'
  | 'info'
  | 'warning'
  | 'danger'
  | 'success'
  | 'dev'
  | 'default'

interface Props {
  children: ReactNode
  variante?: VarianteSelo
  /** Alias legado shadcn */
  variant?: VarianteSelo
  className?: string
}

const mapa: Record<VarianteSelo, string> = {
  padrao: 'vig-selo--padrao',
  default: 'vig-selo--padrao',
  sucesso: 'vig-selo--sucesso',
  success: 'vig-selo--sucesso',
  alerta: 'vig-selo--alerta',
  warning: 'vig-selo--alerta',
  erro: 'vig-selo--erro',
  danger: 'vig-selo--erro',
  info: 'vig-selo--info',
  dev: 'vig-selo--dev',
  teal: 'vig-selo--teal',
  navy: 'vig-selo--navy',
}

/** Badge / tag padrão VIGMED */
export function Selo({ children, variante, variant, className }: Props) {
  const v = variante ?? variant ?? 'padrao'
  return <span className={cn('vig-selo', mapa[v] ?? mapa.padrao, className)}>{children}</span>
}

/** Mapeia variants legados do shadcn Badge */
export function seloDeVarianteShadcn(variant?: string): VarianteSelo {
  if (variant === 'success') return 'sucesso'
  if (variant === 'danger' || variant === 'destructive') return 'erro'
  if (variant === 'warning') return 'alerta'
  if (variant === 'info') return 'info'
  if (variant === 'dev') return 'dev'
  return 'padrao'
}
