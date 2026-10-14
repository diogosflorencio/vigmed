'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PropsRevelarScroll {
  children: ReactNode
  className?: string
  atraso?: number
}

/** Entrada suave ao montar, leve, estilo app */
export function RevelarScroll({ children, className, atraso = 0 }: PropsRevelarScroll) {
  return (
    <div
      className={cn('app-reveal', className)}
      style={atraso ? { animationDelay: `${atraso}s` } : undefined}
    >
      {children}
    </div>
  )
}
