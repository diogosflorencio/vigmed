import { FormularioCadastro } from '@/components/auth/FormularioCadastro'
import { CascaAuth } from '@/components/auth/CascaAuth'

export const metadata = { title: 'Ativar conta - VIGMED' }

export default function PaginaCadastro() {
  return (
    <CascaAuth>
      <FormularioCadastro />
    </CascaAuth>
  )
}
