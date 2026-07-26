import { listarDocumentos, listarCategorias } from '@/lib/documentos/acoes'
import { listarEmpresasResumo } from '@/lib/empresas/acoes'
import { PainelDocumentos } from '@/components/documentos/PainelDocumentos'

export const metadata = { title: 'Documentos - VIGMED Admin' }

export default async function PaginaDocumentosAdmin() {
  const [{ documentos }, empresas, categorias] = await Promise.all([
    listarDocumentos(),
    listarEmpresasResumo(),
    listarCategorias(),
  ])

  return (
    <PainelDocumentos
      documentos={documentos ?? []}
      empresas={empresas}
      categorias={categorias}
      modo="adm"
    />
  )
}
