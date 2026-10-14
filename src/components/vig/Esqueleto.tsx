import { cn } from '@/lib/utils'

interface Props {
  className?: string
  largura?: 'sm' | 'md' | 'lg' | 'full'
}

/** Placeholder animado para estados de carregamento */
export function Esqueleto({ className, largura = 'full' }: Props) {
  const larguras = {
    sm: 'w-1/3',
    md: 'w-2/3',
    lg: 'w-5/6',
    full: 'w-full',
  }

  return <span className={cn('app-esqueleto', larguras[largura], className)} aria-hidden />
}

interface PropsGrupo {
  linhas?: number
  className?: string
  rotulo?: string
}

/** Grupo de linhas esqueleto */
export function EsqueletoGrupo({ linhas = 3, className, rotulo = 'Carregando' }: PropsGrupo) {
  return (
    <div className={cn('app-esqueleto-grupo', className)} aria-busy="true" aria-label={rotulo}>
      {Array.from({ length: linhas }).map((_, i) => (
        <Esqueleto key={i} largura={i === linhas - 1 ? 'md' : 'full'} />
      ))}
    </div>
  )
}

/** Bolhas de chat enquanto carrega mensagens */
export function EsqueletoChat() {
  return (
    <div className="app-esqueleto-chat" aria-busy="true" aria-label="Carregando mensagens">
      <div className="app-esqueleto-chat-linha app-esqueleto-chat-linha--esq">
        <Esqueleto className="h-10 w-48 rounded-2xl" />
      </div>
      <div className="app-esqueleto-chat-linha app-esqueleto-chat-linha--dir">
        <Esqueleto className="h-8 w-36 rounded-2xl" />
      </div>
      <div className="app-esqueleto-chat-linha app-esqueleto-chat-linha--esq">
        <Esqueleto className="h-14 w-56 rounded-2xl" />
      </div>
    </div>
  )
}
