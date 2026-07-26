import { redirect } from 'next/navigation'
import { ROTAS } from '@/lib/rotas'

export default function PaginaRecuperarDocsLegada() {
  redirect(ROTAS.auth.recuperar)
}
