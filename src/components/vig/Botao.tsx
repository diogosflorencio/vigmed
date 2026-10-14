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
    'bg-(--vig-teal) text-white border border-(--vig-teal) hover:bg-(--vig-teal-soft) hover:border-(--vig-teal-soft)',
  secundario:
    'bg-(--app-elevated,var(--color-surface)) text-(--app-text,var(--vig-navy)) border border-(--color-border) hover:bg-(--color-surface-2)',
  contorno:
    'bg-transparent text-(--vig-teal) border border-(--vig-teal) hover:bg-(--app-accent-soft,color-mix(in srgb,var(--vig-teal) 10%,transparent))',
  fantasma: 'bg-transparent text-(--app-text-2,var(--vig-navy)) hover:bg-(--color-surface-2)',
  teal: 'bg-(--vig-teal) text-white border border-(--vig-teal) hover:bg-(--vig-teal-soft)',
  perigo:
    'bg-(--color-danger) text-white border border-(--color-danger) hover:brightness-95',
}

const tamanhos: Record<Tamanho, string> = {
  sm: 'h-9 px-3.5 text-xs gap-1.5 min-w-9',
  md: 'h-11 px-4 text-sm gap-2 min-w-11',
  lg: 'h-12 px-6 text-sm gap-2 font-semibold',
}

const classeBase =
  'vig-btn relative inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--vig-teal) focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

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
  const temTexto = texto != null && texto !== ''

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
      {temTexto && <span>{texto}</span>}
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
    <button type={type} className={classes} disabled={disabled || carregando} aria-busy={carregando || undefined} {...props}>
      {conteudo}
    </button>
  )
}
