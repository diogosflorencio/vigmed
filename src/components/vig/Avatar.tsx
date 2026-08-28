import { cn } from '@/lib/utils'

interface Props {
  nome: string
  tamanho?: 'sm' | 'md' | 'lg'
  className?: string
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

/** Avatar com iniciais, identidade VIGMED */
export function Avatar({ nome, tamanho = 'md', className }: Props) {
  return (
    <span
      className={cn('vig-avatar', `vig-avatar--${tamanho}`, className)}
      aria-hidden
      title={nome}
    >
      {iniciais(nome)}
    </span>
  )
}
