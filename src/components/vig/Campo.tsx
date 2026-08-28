'use client'

import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PropsCampo extends InputHTMLAttributes<HTMLInputElement> {
  rotulo?: string
  /** Alias legado */
  label?: string
  dica?: string
  /** Alias legado */
  hint?: string
  erro?: string
  /** Alias legado */
  error?: string
  prefixo?: ReactNode
  sufixo?: ReactNode
}

/** Input de texto padrão VIGMED */
export function Campo({
  rotulo,
  label,
  dica,
  hint,
  erro,
  error,
  prefixo,
  sufixo,
  className,
  id,
  disabled,
  ...props
}: PropsCampo) {
  const rotuloFinal = rotulo ?? label
  const dicaFinal = dica ?? hint
  const erroFinal = erro ?? error
  const campoId = id ?? rotuloFinal?.toLowerCase().replace(/\s+/g, '-')

  const input = (
    <input
      id={campoId}
      disabled={disabled}
      aria-invalid={!!erroFinal}
      aria-describedby={dicaFinal ? `${campoId}-dica` : erroFinal ? `${campoId}-erro` : undefined}
      className={cn(
        'vig-campo-input',
        prefixo && 'vig-campo-input--prefixo',
        sufixo && 'vig-campo-input--sufixo',
        erroFinal && 'vig-campo-input--erro',
        disabled && 'vig-campo-input--desabilitado',
        className,
      )}
      {...props}
    />
  )

  return (
    <div className="vig-campo">
      {rotuloFinal && (
        <label className="vig-campo-rotulo" htmlFor={campoId}>
          {rotuloFinal}
        </label>
      )}
      {prefixo || sufixo ? (
        <div className="vig-campo-wrap">
          {prefixo && <span className="vig-campo-affix vig-campo-affix--prefixo">{prefixo}</span>}
          {input}
          {sufixo && <span className="vig-campo-affix vig-campo-affix--sufixo">{sufixo}</span>}
        </div>
      ) : (
        input
      )}
      {dicaFinal && !erroFinal && (
        <span id={`${campoId}-dica`} className="vig-campo-dica">
          {dicaFinal}
        </span>
      )}
      {erroFinal && (
        <span id={`${campoId}-erro`} className="vig-campo-erro" role="alert">
          {erroFinal}
        </span>
      )}
    </div>
  )
}
