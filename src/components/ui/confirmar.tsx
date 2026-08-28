'use client'

import { Modal } from '@/components/vig/Modal'
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

/** Diálogo de confirmação padrão VIGMED */
export function Confirm({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  loading,
}: ConfirmProps) {
  return (
    <Modal
      aberto={open}
      onFechar={onClose}
      titulo={title}
      descricao={message}
      rodape={
        <>
          <Botao variante="fantasma" onClick={onClose} filho="Cancelar" />
          <Botao variante="perigo" carregando={loading} onClick={onConfirm} filho={confirmLabel} />
        </>
      }
    >
      <span className="sr-only">{message}</span>
    </Modal>
  )
}
