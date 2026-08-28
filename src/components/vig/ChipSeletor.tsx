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
}

/** Seletor em pílulas, modo, tema, layout de menu */
export function ChipSeletor<T extends string>({ opcoes, valor, aoMudar, className }: Props<T>) {
  return (
    <div className={cn('vig-chip-grupo', className)}>
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
            {op.rotulo}
          </button>
        )
      })}
    </div>
  )
}
