import { carregarPainelAdmin } from '@/lib/painel/acoes'
import { PainelPainelAdm } from '@/components/painel/PainelPainelAdm'

export const metadata = { title: 'Painel - VIGMED Admin' }

export default async function PaginaPainelAdmin() {
  const dados = await carregarPainelAdmin()
  return <PainelPainelAdm {...dados} />
}
