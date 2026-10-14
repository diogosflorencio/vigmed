import { Suspense } from 'react'
import { listarDocumentos, listarCategorias } from '@/lib/documentos/acoes'
import { obterPerfilAtual } from '@/lib/auth/sessao'
import { obterCotaArmazenamentoEmpresaAtual } from '@/lib/painel/acoes'
import { PainelDocumentos } from '@/components/documentos/PainelDocumentos'
import { CarregandoPainel } from '@/components/layout/CarregandoPainel'

export const metadata = { title: 'Documentos · VIGMED Docs' }

export default async function PaginaDocumentosDocs() {
  const [perfil, { documentos }, categorias, cota] = await Promise.all([
    obterPerfilAtual(),
    listarDocumentos(),
    listarCategorias(),
    obterCotaArmazenamentoEmpresaAtual(),
  ])

  return (
    <Suspense fallback={<CarregandoPainel rotulo="Carregando documentos" />}>
      <PainelDocumentos
        documentos={documentos ?? []}
        empresas={[]}
        categorias={categorias}
        modo="docs"
        perfilId={perfil?.id}
        cota={cota}
      />
    </Suspense>
  )
}
