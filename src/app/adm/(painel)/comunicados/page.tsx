import { listarComunicadosAdmin } from '@/lib/comunicados/acoes'
import { listarEmpresasResumo } from '@/lib/empresas/acoes'
import { PainelComunicadosAdm } from '@/components/comunicados/PainelComunicadosAdm'

export const metadata = { title: 'Comunicados - VIGMED Admin' }

export default async function PaginaComunicadosAdmin() {
  const [{ comunicados }, empresas] = await Promise.all([
    listarComunicadosAdmin(),
    listarEmpresasResumo(),
  ])

  return (
    <PainelComunicadosAdm
      comunicadosIniciais={comunicados}
      empresas={empresas}
    />
  )
}
