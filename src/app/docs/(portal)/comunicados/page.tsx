import { Suspense } from 'react'
import { listarComunicadosEmpresa } from '@/lib/comunicados/acoes'
import { PainelComunicadosDocs } from '@/components/comunicados/PainelComunicadosDocs'
import { CarregandoPainel } from '@/components/layout/CarregandoPainel'

export const metadata = { title: 'Comunicados · VIGMED Docs' }

export default async function PaginaComunicadosDocs() {
  const { comunicados } = await listarComunicadosEmpresa()
  return (
    <Suspense fallback={<CarregandoPainel rotulo="Carregando comunicados" />}>
      <PainelComunicadosDocs comunicados={comunicados} />
    </Suspense>
  )
}
