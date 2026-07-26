import { redirect } from 'next/navigation'
import { ROTAS } from '@/lib/rotas'

export default function PaginaCadastroDocsLegada() {
  redirect(ROTAS.auth.cadastro)
}
