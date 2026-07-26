import { redirect } from 'next/navigation'
import { ROTAS } from '@/lib/rotas'

export default function PaginaCadastroAdminLegada() {
  redirect(ROTAS.auth.cadastro)
}
