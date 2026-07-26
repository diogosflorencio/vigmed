import { obterPerfilAtual } from '@/lib/auth/sessao'
import { PainelPerfil } from '@/components/perfil/PainelPerfil'

export const metadata = { title: 'Perfil - VIGMED Admin' }

export default async function PaginaPerfilAdmin() {
  const perfil = await obterPerfilAtual()
  if (!perfil) return null
  return <PainelPerfil perfil={perfil} />
}
