import { listarDocumentos, listarCategorias } from '@/lib/documentos/acoes'
import { PainelDocumentos } from '@/components/documentos/PainelDocumentos'

export const metadata = { title: 'Documentos - VIGMED Docs' }

export default async function PaginaDocumentosDocs() {
  const [{ documentos }, categorias] = await Promise.all([listarDocumentos(), listarCategorias()])

  return (
    <PainelDocumentos
      documentos={documentos ?? []}
      empresas={[]}
      categorias={categorias}
      modo="docs"
    />
  )
}
