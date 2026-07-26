import { obterPerfilAtual } from '@/lib/auth/sessao'
import { PainelPerfil } from '@/components/perfil/PainelPerfil'

export const metadata = { title: 'Perfil · VIGMED Docs' }

export default async function PaginaPerfilDocs() {
  const perfil = await obterPerfilAtual()
  if (!perfil) return null
  return <PainelPerfil perfil={perfil} />
}
