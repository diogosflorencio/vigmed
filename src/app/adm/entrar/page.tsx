import { redirect } from 'next/navigation'
import { ROTAS } from '@/lib/rotas'

export default function PaginaEntrarAdminLegada() {
  redirect(ROTAS.auth.entrar)
}
