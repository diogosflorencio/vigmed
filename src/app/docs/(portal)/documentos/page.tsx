import { listarDocumentos, listarCategorias } from '@/lib/documentos/acoes'
import { obterPerfilAtual } from '@/lib/auth/sessao'
import { PainelDocumentos } from '@/components/documentos/PainelDocumentos'

export const metadata = { title: 'Documentos · VIGMED Docs' }

export default async function PaginaDocumentosDocs() {
  const [perfil, { documentos }, categorias] = await Promise.all([
    obterPerfilAtual(),
    listarDocumentos(),
    listarCategorias(),
  ])

  return (
    <PainelDocumentos
      documentos={documentos ?? []}
      empresas={[]}
      categorias={categorias}
      modo="docs"
      perfilId={perfil?.id}
    />
  )
}
