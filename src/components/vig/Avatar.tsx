import { cn } from '@/lib/utils'

interface Props {
  nome: string
  /** Só renderiza se houver URL real de foto */
  url?: string | null
  tamanho?: 'sm' | 'md' | 'lg'
  className?: string
}

/** Foto de perfil circular. Sem URL, não mostra nada. */
export function Avatar({ nome, url, tamanho = 'md', className }: Props) {
  if (!url) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      title={nome}
      loading="lazy"
      decoding="async"
      className={cn('vig-avatar vig-avatar--foto', `vig-avatar--${tamanho}`, className)}
    />
  )
}
