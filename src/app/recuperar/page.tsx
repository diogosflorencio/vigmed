import { FormularioRecuperarSenha } from '@/components/auth/FormularioRecuperarSenha'
import { CascaAuth } from '@/components/auth/CascaAuth'

export const metadata = { title: 'Recuperar senha - VIGMED' }

export default function PaginaRecuperar() {
  return (
    <CascaAuth>
      <FormularioRecuperarSenha />
    </CascaAuth>
  )
}
