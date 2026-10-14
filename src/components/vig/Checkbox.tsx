'use client'

import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PropsCheckbox {
  rotulo: ReactNode
  descricao?: ReactNode
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

/** Checkbox estilizado VIGMED */
export function Checkbox({ rotulo, descricao, checked, onChange, disabled, className, id }: PropsCheckbox) {
  const gerado = useId()
  const campoId = id ?? gerado

  return (
    <label className={cn('vig-checkbox', disabled && 'vig-checkbox--desabilitado', className)} htmlFor={campoId}>
      <input
        id={campoId}
        type="checkbox"
        className="vig-checkbox-input"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="vig-checkbox-caixa" aria-hidden />
      <span className="vig-checkbox-texto">
        <span className="vig-checkbox-rotulo">{rotulo}</span>
        {descricao && <span className="vig-checkbox-descricao">{descricao}</span>}
      </span>
    </label>
  )
}

/** Checkbox nativo dentro de label flex, compatível com forms existentes */
export function CheckboxInline({
  rotulo,
  descricao,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { rotulo: ReactNode; descricao?: ReactNode }) {
  return (
    <label className={cn('vig-checkbox vig-checkbox--inline', className)}>
      <input type="checkbox" className="vig-checkbox-input" {...props} />
      <span className="vig-checkbox-caixa" aria-hidden />
      <span className="vig-checkbox-texto">
        <span className="vig-checkbox-rotulo">{rotulo}</span>
        {descricao && <span className="vig-checkbox-descricao">{descricao}</span>}
      </span>
    </label>
  )
}
