'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Opcao<T extends string> {
  id: T
  rotulo: string
  icone?: ReactNode
  preview?: ReactNode
}

interface Props<T extends string> {
  opcoes: Opcao<T>[]
  valor: T
  aoMudar: (valor: T) => void
  className?: string
  rotulo?: string
}

/** Seletor em pílulas, touch-friendly e acessível */
export function ChipSeletor<T extends string>({ opcoes, valor, aoMudar, className, rotulo }: Props<T>) {
  return (
    <div
      className={cn('vig-chip-grupo', className)}
      role="group"
      aria-label={rotulo ?? 'Opções'}
    >
      {opcoes.map((op) => {
        const ativo = valor === op.id
        return (
          <button
            key={op.id}
            type="button"
            onClick={() => aoMudar(op.id)}
            aria-pressed={ativo}
            className={cn('vig-chip', ativo && 'vig-chip--ativo')}
          >
            {op.preview}
            {op.icone}
            <span>{op.rotulo}</span>
          </button>
        )
      })}
    </div>
  )
}
