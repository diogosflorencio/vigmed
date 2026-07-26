import { listarConversas } from '@/lib/mensagens/acoes'
import { listarEmpresasResumo } from '@/lib/empresas/acoes'
import { obterPerfilAtual } from '@/lib/auth/sessao'
import { PainelMensagens } from '@/components/mensagens/PainelMensagens'

export const metadata = { title: 'Mensagens - VIGMED Admin' }

export default async function PaginaMensagensAdmin() {
  const [perfil, { conversas }, empresas] = await Promise.all([
    obterPerfilAtual(),
    listarConversas(),
    listarEmpresasResumo(),
  ])

  return (
    <PainelMensagens
      conversasIniciais={conversas}
      empresas={empresas}
      perfilId={perfil?.id ?? ''}
      modoAdmin
    />
  )
}
