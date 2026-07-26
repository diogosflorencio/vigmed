import type { ReactNode } from 'react'
import type { AmbienteApp } from '@/lib/ambiente'
import { ForcarTemaAuth } from '@/components/auth/ForcarTemaAuth'

interface Props {
  children: ReactNode
}

/** Wrapper visual compartilhado das páginas públicas de autenticação */
export function CascaAuth({ children }: Props) {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-12 auth-shell">
      <ForcarTemaAuth />
      {children}
    </div>
  )
}

export function tituloAuth(ambiente: AmbienteApp, tipo: 'entrar' | 'cadastro' | 'recuperar') {
  const portal = ambiente === 'adm' ? 'VIGMED Admin' : 'VIGMED Docs'
  const acoes = {
    entrar: 'Entrar',
    cadastro: 'Ativar conta',
    recuperar: 'Recuperar senha',
  }
  return `${acoes[tipo]} · ${portal}`
}
