'use client'

import { cloneElement, isValidElement, type ComponentProps, type ReactElement, type ReactNode } from 'react'
import { Botao, type VarianteBotao } from '@/components/vig/Botao'
import { Campo } from '@/components/vig/Campo'
import { AreaTexto } from '@/components/vig/AreaTexto'
import { Seletor } from '@/components/vig/Seletor'
import { Selo } from '@/components/vig/Selo'
import { Avatar as AvatarVig } from '@/components/vig/Avatar'
import { Cartao } from '@/components/vig/Cartao'
import { Modal } from '@/components/vig/Modal'
import { cn } from '@/lib/utils'

export { Botao, Campo, AreaTexto, Seletor, Selo, Cartao, Modal }
export { Checkbox, CheckboxInline } from '@/components/vig/Checkbox'
export { Metrica } from '@/components/vig/Metrica'
export { ChipSeletor } from '@/components/vig/ChipSeletor'
export { FlipBox } from '@/components/vig/FlipBox'
export { PaginaHero } from '@/components/vig/PaginaHero'

type VarianteBotaoLegado = 'primary' | 'ghost' | 'danger' | 'outline'
type TamanhoBotaoLegado = 'sm' | 'md' | 'lg'

const mapaBotao: Record<VarianteBotaoLegado, VarianteBotao> = {
  primary: 'primario',
  ghost: 'fantasma',
  danger: 'perigo',
  outline: 'secundario',
}

interface BotaoLegadoProps extends Omit<ComponentProps<typeof Botao>, 'variante' | 'carregando' | 'filho'> {
  variant?: VarianteBotaoLegado
  size?: TamanhoBotaoLegado
  loading?: boolean
  render?: ReactNode
}

/** @deprecated Preferir `Botao` de `@/components/vig/Botao` */
export function Button({
  variant = 'outline',
  size = 'md',
  loading,
  children,
  className,
  render,
  ...props
}: BotaoLegadoProps) {
  const variante = mapaBotao[variant]

  if (render && isValidElement(render)) {
    const el = render as ReactElement<{ className?: string; children?: ReactNode }>
    return cloneElement(el, {
      className: cn(
        'vig-btn relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
        variante === 'primario' && 'bg-[var(--vig-navy)] text-white border border-[var(--vig-navy)]',
        variante === 'secundario' &&
          'bg-[var(--color-surface)] text-[var(--vig-navy)] border border-[var(--color-border)]',
        variante === 'fantasma' && 'bg-transparent text-[var(--vig-navy)]',
        variante === 'perigo' && 'bg-[#b42318] text-white border border-[#b42318]',
        size === 'sm' && 'h-8 px-3 text-xs gap-1.5',
        size === 'md' && 'h-10 px-5 text-sm gap-2',
        size === 'lg' && 'h-12 px-7 text-sm gap-2.5',
        className,
        el.props.className,
      ),
      children: (
        <>
          {loading && <span className="vig-btn-spinner" aria-hidden />}
          {children}
        </>
      ),
    })
  }

  return (
    <Botao
      variante={variante}
      tamanho={size}
      carregando={loading}
      className={className}
      filho={children}
      {...props}
    />
  )
}

/** @deprecated Preferir `Campo` */
export const Input = Campo

/** @deprecated Preferir `AreaTexto` */
export const Textarea = AreaTexto

/** @deprecated Preferir `Selo` */
export const Badge = Selo

/** @deprecated Preferir `AvatarVig`, aceita `name` ou `nome` */
export function Avatar({ name, nome, size = 'md' }: { name?: string; nome?: string; size?: 'sm' | 'md' | 'lg' }) {
  return <AvatarVig nome={nome ?? name ?? '?'} tamanho={size} />
}

export function Label({ children, htmlFor, className }: { children: ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn('vig-campo-rotulo', className)}>
      {children}
    </label>
  )
}

export function Separator({ className }: { className?: string }) {
  return <hr className={cn('vig-separador', className)} />
}

export function Divider(props: { className?: string }) {
  return <Separator {...props} />
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('vig-esqueleto', className)} aria-hidden />
}

export function Spinner({ className }: { className?: string }) {
  return <span className={cn('vig-btn-spinner vig-btn-spinner--solo', className)} aria-hidden />
}

/** Card legado → Cartao VIGMED */
export function Card({
  children,
  className,
  titulo,
  descricao,
}: {
  children: ReactNode
  className?: string
  titulo?: string
  descricao?: string
}) {
  return (
    <Cartao titulo={titulo} descricao={descricao} className={className}>
      {children}
    </Cartao>
  )
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <header className={cn('mb-4 pb-3 border-b border-[var(--color-border)]', className)}>{children}</header>
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-base font-semibold text-[var(--vig-navy)]', className)}>{children}</h3>
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-xs text-[var(--color-text-3)] mt-1', className)}>{children}</p>
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <footer className={cn('mt-4 pt-3 border-t border-[var(--color-border)]', className)}>{children}</footer>
}

export function CardAction({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function Empty({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="vig-vazio vig-vazio--grande">
      {icon}
      <p className="vig-vazio-titulo">{title}</p>
      {description && <p className="vig-vazio-desc">{description}</p>}
      {action}
    </div>
  )
}

/** Dialog compat, usa Modal VIGMED por baixo */
export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}) {
  if (!open) return null
  return <>{children}</>
}

export function DialogContent({
  children,
  className,
  showCloseButton: _showCloseButton,
}: {
  children: ReactNode
  className?: string
  showCloseButton?: boolean
}) {
  return <div className={cn('vig-dialog-content', className)}>{children}</div>
}

export function DialogHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <header className={cn('vig-modal-cabecalho border-0 pb-0', className)}>{children}</header>
}

export function DialogTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn('vig-modal-titulo', className)}>{children}</h2>
}

export function DialogDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('vig-modal-descricao', className)}>{children}</p>
}

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <footer className={cn('vig-modal-rodape', className)}>{children}</footer>
}

export function DialogTrigger({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function DialogClose({ children }: { children: ReactNode }) {
  return <>{children}</>
}
