import { listarEmpresas } from '@/lib/empresas/acoes'
import { obterConsumoPorEmpresas } from '@/lib/documentos/armazenamento'
import { PainelEmpresas } from '@/components/empresas/PainelEmpresas'

export const metadata = { title: 'Empresas · VIGMED Admin' }

export default async function PaginaEmpresas() {
  const { empresas } = await listarEmpresas()
  const consumoMap = await obterConsumoPorEmpresas(empresas.map((e) => e.id))
  const consumoPorEmpresa = Object.fromEntries(consumoMap)

  return <PainelEmpresas empresasIniciais={empresas} consumoPorEmpresa={consumoPorEmpresa} />
}
