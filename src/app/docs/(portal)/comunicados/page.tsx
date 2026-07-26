import { listarComunicadosEmpresa } from '@/lib/comunicados/acoes'
import { PainelComunicadosDocs } from '@/components/comunicados/PainelComunicadosDocs'

export const metadata = { title: 'Comunicados - VIGMED Docs' }

export default async function PaginaComunicadosDocs() {
  const { comunicados } = await listarComunicadosEmpresa()
  return <PainelComunicadosDocs comunicados={comunicados} />
}
