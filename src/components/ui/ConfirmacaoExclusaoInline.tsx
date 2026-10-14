'use client'

import { Check, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  ariaLabel: string
  confirmando: boolean
  desabilitado?: boolean
  onPedir: () => void
  onConfirmar: () => void
  onCancelar: () => void
  compacta?: boolean
  rotulo?: string
  rotuloConfirmar?: string
}

/** Exclusão inline: pedir → confirmar ou cancelar (sem modal). */
export function ConfirmacaoExclusaoInline({
  ariaLabel,
  confirmando,
  desabilitado,
  onPedir,
  onConfirmar,
  onCancelar,
  compacta = false,
  rotulo = 'Excluir',
  rotuloConfirmar = 'Excluir?',
}: Props) {
  if (confirmando) {
    return (
      <div
        className={cn(
          'exclusao-inline exclusao-inline--confirmando',
          compacta && 'exclusao-inline--compacta',
        )}
        role="group"
        aria-label={`Confirmar ${ariaLabel}`}
      >
        {!compacta && <span className="exclusao-inline-rotulo">{rotuloConfirmar}</span>}
        <button
          type="button"
          className="exclusao-inline-btn exclusao-inline-btn--ok"
          disabled={desabilitado}
          onClick={onConfirmar}
          aria-label={`Confirmar ${ariaLabel}`}
          title="Confirmar"
        >
          {compacta ? <Check size={14} strokeWidth={2.5} /> : 'Sim'}
        </button>
        <button
          type="button"
          className="exclusao-inline-btn exclusao-inline-btn--cancelar"
          disabled={desabilitado}
          onClick={onCancelar}
          aria-label="Cancelar"
          title="Cancelar"
        >
          {compacta ? <X size={14} strokeWidth={2.5} /> : 'Não'}
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      className={cn(
        'exclusao-inline-btn exclusao-inline-btn--pedir',
        compacta && 'exclusao-inline-btn--icone',
      )}
      disabled={desabilitado}
      onClick={onPedir}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {compacta ? <Trash2 size={14} strokeWidth={2.2} /> : rotulo}
    </button>
  )
}
