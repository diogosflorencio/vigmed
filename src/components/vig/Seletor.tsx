'use client'

import type { SelectHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PropsSeletor extends SelectHTMLAttributes<HTMLSelectElement> {
  rotulo?: string
  label?: string
  dica?: string
  hint?: string
  erro?: string
  error?: string
  opcoes?: { valor: string; rotulo: string }[]
  placeholder?: string
  children?: ReactNode
}

/** Select padrão VIGMED */
export function Seletor({
  rotulo,
  label,
  dica,
  hint,
  erro,
  error,
  opcoes,
  placeholder,
  className,
  id,
  children,
  ...props
}: PropsSeletor) {
  const rotuloFinal = rotulo ?? label
  const dicaFinal = dica ?? hint
  const erroFinal = erro ?? error
  const campoId = id ?? rotuloFinal?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="vig-campo">
      {rotuloFinal && (
        <label className="vig-campo-rotulo" htmlFor={campoId}>
          {rotuloFinal}
        </label>
      )}
      <select
        id={campoId}
        aria-invalid={!!erroFinal}
        className={cn('vig-campo-input vig-campo-select', erroFinal && 'vig-campo-input--erro', className)}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {opcoes
          ? opcoes.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))
          : children}
      </select>
      {dicaFinal && !erroFinal && <span className="vig-campo-dica">{dicaFinal}</span>}
      {erroFinal && (
        <span className="vig-campo-erro" role="alert">
          {erroFinal}
        </span>
      )}
    </div>
  )
}
