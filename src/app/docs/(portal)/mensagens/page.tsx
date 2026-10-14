import { Suspense } from 'react'
import { listarConversas } from '@/lib/mensagens/acoes'
import { obterPerfilAtual } from '@/lib/auth/sessao'
import { PainelMensagens } from '@/components/mensagens/PainelMensagens'
import { CarregandoPainel } from '@/components/layout/CarregandoPainel'

export const metadata = { title: 'Mensagens · VIGMED Docs' }

export default async function PaginaMensagensDocs() {
  const [perfil, { conversas }] = await Promise.all([
    obterPerfilAtual(),
    listarConversas(),
  ])

  return (
    <Suspense fallback={<CarregandoPainel rotulo="Carregando mensagens" />}>
      <PainelMensagens
        conversasIniciais={conversas}
        empresas={[]}
        perfilId={perfil?.id ?? ''}
        modoAdmin={false}
      />
    </Suspense>
  )
}