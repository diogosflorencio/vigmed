import { ehAdministrador } from '@/lib/auth/sessao'
import type { Perfil } from '@/types'

export function origemPublicacaoDocumento(perfil: Perfil): 'admin' | 'empresa' {
  return ehAdministrador(perfil.papel) ? 'admin' : 'empresa'
}

export function perfilPodePublicarDocumentos(papel: Perfil['papel']): boolean {
  return (
    papel === 'administrador' ||
    papel === 'administrador_empresa' ||
    papel === 'usuario_empresa'
  )
}
