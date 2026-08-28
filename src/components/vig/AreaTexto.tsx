'use client'

import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface PropsAreaTexto extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  rotulo?: string
  label?: string
  dica?: string
  hint?: string
  erro?: string
  error?: string
}

/** Textarea padrão VIGMED */
export function AreaTexto({
  rotulo,
  label,
  dica,
  hint,
  erro,
  error,
  className,
  id,
  ...props
}: PropsAreaTexto) {
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
      <textarea
        id={campoId}
        aria-invalid={!!erroFinal}
        className={cn('vig-campo-input vig-campo-textarea', erroFinal && 'vig-campo-input--erro', className)}
        {...props}
      />
      {dicaFinal && !erroFinal && <span className="vig-campo-dica">{dicaFinal}</span>}
      {erroFinal && (
        <span className="vig-campo-erro" role="alert">
          {erroFinal}
        </span>
      )}
    </div>
  )
}
