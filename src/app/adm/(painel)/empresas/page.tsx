import { listarEmpresas } from '@/lib/empresas/acoes'
import { obterConsumoPorEmpresas, obterTotaisArmazenamento } from '@/lib/documentos/armazenamento'
import { PainelEmpresas } from '@/components/empresas/PainelEmpresas'

export const metadata = { title: 'Empresas · VIGMED Admin' }

export default async function PaginaEmpresas() {
  const { empresas } = await listarEmpresas()
  const [consumoMap, totaisArmazenamento] = await Promise.all([
    obterConsumoPorEmpresas(empresas.map((e) => e.id)),
    obterTotaisArmazenamento(),
  ])
  const consumoPorEmpresa = Object.fromEntries(consumoMap)

  return (
    <PainelEmpresas
      empresasIniciais={empresas}
      consumoPorEmpresa={consumoPorEmpresa}
      totaisArmazenamento={totaisArmazenamento}
    />
  )
}
