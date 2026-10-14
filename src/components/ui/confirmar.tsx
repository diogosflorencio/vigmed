'use client'

import { createPortal } from 'react-dom'
import { Botao } from '@/components/vig/Botao'

interface ConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
}

/** Confirmação em barra fixa na tela (sem modal). */
export function Confirm({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  loading,
}: ConfirmProps) {
  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="vm-confirm-barra" role="alertdialog" aria-modal="true" aria-labelledby="vm-confirm-titulo">
      <div className="vm-confirm-texto">
        <strong id="vm-confirm-titulo">{title}</strong>
        <p>{message}</p>
      </div>
      <div className="vm-confirm-acoes">
        <Botao variante="fantasma" onClick={onClose} filho="Cancelar" />
        <Botao variante="perigo" carregando={loading} onClick={onConfirm} filho={confirmLabel} />
      </div>
    </div>,
    document.body,
  )
}
