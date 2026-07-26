import { buscarRelatorios } from '@/lib/relatorios/acoes'
import { PainelRelatorios } from '@/components/relatorios/PainelRelatorios'

export const metadata = { title: 'Relatórios · VIGMED Admin' }

export default async function PaginaRelatorios() {
  const dados = await buscarRelatorios()
  return <PainelRelatorios dados={dados} />
}
