'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export type VarianteBotao = 'primario' | 'secundario' | 'contorno' | 'fantasma' | 'teal' | 'perigo'

type Tamanho = 'sm' | 'md' | 'lg'

export interface PropsBotao extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao
  tamanho?: Tamanho
  icone?: ReactNode
  filho?: ReactNode
  href?: string
  carregando?: boolean
}

const variantes: Record<VarianteBotao, string> = {
  primario:
    'bg-[var(--vig-navy)] text-white border border-[var(--vig-navy)] hover:bg-[var(--vig-navy-soft)] shadow-[0_4px_14px_rgba(15,39,68,0.25)]',
  secundario:
    'bg-[var(--color-surface)] text-[var(--vig-navy)] border border-[var(--color-border)] hover:border-[var(--vig-teal)] hover:text-[var(--vig-teal)]',
  contorno:
    'bg-transparent text-[var(--vig-navy)] border-2 border-[var(--vig-teal)] hover:bg-[var(--vig-teal)] hover:text-white',
  fantasma: 'bg-transparent text-[var(--vig-navy)] hover:bg-[var(--color-surface-2)]',
  teal: 'bg-[var(--vig-teal)] text-white border border-[var(--vig-teal)] hover:bg-[var(--vig-teal-soft)] shadow-[0_4px_14px_rgba(13,148,136,0.3)]',
  perigo:
    'bg-[#b42318] text-white border border-[#b42318] hover:bg-[#991b1b] shadow-[0_4px_14px_rgba(180,35,24,0.25)]',
}

const tamanhos: Record<Tamanho, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 min-w-[2rem]',
  md: 'h-10 px-5 text-sm gap-2 min-w-[2.5rem]',
  lg: 'h-12 px-7 text-sm gap-2.5 font-semibold',
}

const classeBase =
  'vig-btn relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vig-teal)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

function Spinner() {
  return <span className="vig-btn-spinner" aria-hidden />
}

/** Botão padrão VIGMED */
export function Botao({
  variante = 'primario',
  tamanho = 'md',
  icone,
  filho,
  children,
  className,
  href,
  carregando,
  disabled,
  type = 'button',
  ...props
}: PropsBotao) {
  const texto = filho ?? children

  const classes = cn(
    classeBase,
    variantes[variante],
    tamanhos[tamanho],
    carregando && 'vig-btn--carregando',
    className,
  )

  const conteudo = (
    <>
      {carregando ? <Spinner /> : icone}
      {texto != null && texto !== '' && <span>{texto}</span>}
    </>
  )

  if (href) {
    if (href.startsWith('#')) {
      return (
        <a href={href} className={classes}>
          {conteudo}
        </a>
      )
    }
    return (
      <Link href={href} className={classes}>
        {conteudo}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled || carregando} {...props}>
      {conteudo}
    </button>
  )
}
