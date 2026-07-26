import { redirect } from 'next/navigation'
import { ROTAS } from '@/lib/rotas'

export default function PaginaRecuperarAdminLegada() {
  redirect(ROTAS.auth.recuperar)
}
