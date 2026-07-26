'use client'

import { type ComponentProps, type ReactNode } from 'react'
import { Button as BotaoShadcn } from '@/components/ui/button'
import { Input as InputShadcn } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea as TextareaShadcn } from '@/components/ui/textarea'
import { Badge as BadgeShadcn } from '@/components/ui/badge'
import { Avatar as AvatarShadcn, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton as SkeletonShadcn } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn, obterIniciais } from '@/lib/utils'

// Reexporta componentes shadcn diretamente
export { Button as BotaoBase } from '@/components/ui/button'
export { Input as InputBase } from '@/components/ui/input'
export { Label } from '@/components/ui/label'
export { Textarea as TextareaBase } from '@/components/ui/textarea'
export { Badge as BadgeBase, badgeVariants } from '@/components/ui/badge'
export { Avatar as AvatarBase, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
export { Skeleton as SkeletonBase } from '@/components/ui/skeleton'
export { Spinner } from '@/components/ui/spinner'
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from '@/components/ui/card'
export { Separator } from '@/components/ui/separator'
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'

type VarianteBotao = 'primary' | 'ghost' | 'danger' | 'outline'
type TamanhoBotao = 'sm' | 'md' | 'lg'

interface BotaoProps extends Omit<ComponentProps<typeof BotaoShadcn>, 'variant' | 'size'> {
  variant?: VarianteBotao
  size?: TamanhoBotao
  loading?: boolean
}

const mapaVarianteBotao = {
  primary: 'default',
  ghost: 'ghost',
  danger: 'destructive',
  outline: 'outline',
} as const

const mapaTamanhoBotao = {
  sm: 'sm',
  md: 'default',
  lg: 'lg',
} as const

/** Botão com API compatível + suporte a loading */
export function Button({
  variant = 'outline',
  size = 'md',
  loading,
  disabled,
  children,
  className,
  ...props
}: BotaoProps) {
  return (
    <BotaoShadcn
      variant={mapaVarianteBotao[variant]}
      size={mapaTamanhoBotao[size]}
      disabled={disabled || loading}
      className={cn('gap-2', className)}
      {...props}
    >
      {loading && <Spinner className="size-3.5" />}
      {children}
    </BotaoShadcn>
  )
}

interface CampoInputProps extends ComponentProps<typeof InputShadcn> {
  label?: string
  hint?: string
  error?: string
}

/** Input com label e mensagens de erro/dica */
export function Input({ label, hint, error, className, id, ...props }: CampoInputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <InputShadcn id={inputId} aria-invalid={!!error} className={className} {...props} />
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

interface CampoTextareaProps extends ComponentProps<typeof TextareaShadcn> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, id, ...props }: CampoTextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <TextareaShadcn id={inputId} aria-invalid={!!error} className={className} {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

type VarianteBadge = 'default' | 'info' | 'warning' | 'danger' | 'success' | 'dev'

interface BadgeProps {
  variant?: VarianteBadge
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const estilos: Record<VarianteBadge, string> = {
    default: '',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
    danger: '',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
    dev: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300',
  }

  const varianteShadcn =
    variant === 'danger' ? 'destructive' : variant === 'default' ? 'secondary' : 'outline'

  return (
    <BadgeShadcn variant={varianteShadcn} className={cn(estilos[variant], className)}>
      {children}
    </BadgeShadcn>
  )
}

/** Avatar com iniciais do nome */
export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const tamanho = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'
  return (
    <AvatarShadcn size={tamanho}>
      <AvatarFallback>{obterIniciais(name)}</AvatarFallback>
    </AvatarShadcn>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <SkeletonShadcn className={className} />
}

/** Estado vazio com Card shadcn */
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
    <Card className="surface-card border-dashed border-[var(--glass-border)] bg-transparent shadow-none">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        {icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-3)] text-[var(--color-text-2)]">
            {icon}
          </div>
        )}
        <p className="text-sm font-semibold text-[var(--color-text-1)]">{title}</p>
        {description && (
          <p className="max-w-sm text-sm text-[var(--color-text-2)] leading-relaxed">{description}</p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </CardContent>
    </Card>
  )
}

export function Divider({ className }: { className?: string }) {
  return <Separator className={className} />
}
