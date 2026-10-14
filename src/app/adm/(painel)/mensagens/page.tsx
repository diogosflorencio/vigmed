import { Suspense } from 'react'
import { listarConversas } from '@/lib/mensagens/acoes'
import { listarEmpresasResumo } from '@/lib/empresas/acoes'
import { obterPerfilAtual } from '@/lib/auth/sessao'
import { PainelMensagens } from '@/components/mensagens/PainelMensagens'
import { CarregandoPainel } from '@/components/layout/CarregandoPainel'

export const metadata = { title: 'Mensagens · VIGMED Admin' }

export default async function PaginaMensagensAdmin() {
  const [perfil, { conversas }, empresas] = await Promise.all([
    obterPerfilAtual(),
    listarConversas(),
    listarEmpresasResumo(),
  ])

  return (
    <Suspense fallback={<CarregandoPainel rotulo="Carregando mensagens" />}>
      <PainelMensagens
        conversasIniciais={conversas}
        empresas={empresas}
        perfilId={perfil?.id ?? ''}
        modoAdmin
      />
    </Suspense>
  )
}
