import { FormularioLogin } from '@/components/auth/FormularioLogin'
import { CascaAuth } from '@/components/auth/CascaAuth'

export const metadata = { title: 'Entrar · VIGMED' }

export default function PaginaEntrar() {
  return (
    <CascaAuth>
      <FormularioLogin
        titulo="Entrar no VIGMED"
        subtitulo="Use o e-mail autorizado. O sistema abre o painel conforme seu perfil."
        permitirCadastro
      />
    </CascaAuth>
  )
}
