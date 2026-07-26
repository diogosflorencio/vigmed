import type { PrioridadeComunicado } from '@/types'

export const BADGE_PRIORIDADE: Record<PrioridadeComunicado, 'danger' | 'warning' | 'info' | 'default'> = {
  urgente: 'danger',
  alta: 'warning',
  normal: 'default',
  baixa: 'info',
}
