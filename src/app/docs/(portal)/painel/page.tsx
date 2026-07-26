import { buscarDadosInicioDocs } from '@/lib/painel/acoes'
import { PainelInicioDocs } from '@/components/painel/PainelInicioDocs'

export const metadata = { title: 'Início · VIGMED Docs' }

export default async function PaginaPainelDocs() {
  const dados = await buscarDadosInicioDocs()
  return <PainelInicioDocs {...dados} />
}
