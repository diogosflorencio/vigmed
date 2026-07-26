import { redirect } from 'next/navigation'
import { ROTAS } from '@/lib/rotas'

export default function PaginaEntrarDocsLegada() {
  redirect(ROTAS.auth.entrar)
}
