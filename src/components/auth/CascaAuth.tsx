import type { ReactNode } from 'react'
import { CascaAuthCliente } from '@/components/auth/CascaAuthCliente'
import { FonteAuth } from '@/components/auth/FonteAuth'
import type { AmbienteApp } from '@/lib/ambiente'

interface Props {
  children: ReactNode
}

/** Wrapper visual das páginas de autenticação */
export function CascaAuth({ children }: Props) {
  return (
    <FonteAuth>
      <CascaAuthCliente>{children}</CascaAuthCliente>
    </FonteAuth>
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
