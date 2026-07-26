import { notFound } from 'next/navigation'
import { obterConsumoPorEmpresas } from '@/lib/documentos/armazenamento'
import { obterEmpresa } from '@/lib/empresas/acoes'
import { listarUsuariosPorEmpresa } from '@/lib/usuarios/acoes'
import { PainelEmpresaDetalhe } from '@/components/empresas/PainelEmpresaDetalhe'

export const metadata = { title: 'Empresa · VIGMED Admin' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function PaginaEmpresaDetalhe({ params }: Props) {
  const { id } = await params
  const [{ empresa }, consumoMap, usuarios] = await Promise.all([
    obterEmpresa(id),
    obterConsumoPorEmpresas([id]),
    listarUsuariosPorEmpresa(id),
  ])

  if (!empresa) notFound()

  const consumo = consumoMap.get(id) ?? {
    empresaId: id,
    total: empresa.armazenamento_usado,
    vigmed: 0,
    empresa: empresa.armazenamento_usado,
  }

  return (
    <PainelEmpresaDetalhe
      empresa={empresa}
      consumo={consumo}
      perfis={usuarios.perfis}
      convites={usuarios.convites}
    />
  )
}
