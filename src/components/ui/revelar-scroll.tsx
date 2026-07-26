'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PropsRevelarScroll {
  children: ReactNode
  className?: string
  atraso?: number
}

/** Revela conteúdo com animação suave ao entrar no viewport */
export function RevelarScroll({ children, className, atraso = 0 }: PropsRevelarScroll) {
  const reduzir = useReducedMotion()

  return (
    <motion.div
      className={cn(className)}
      initial={reduzir ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.42, delay: atraso, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
