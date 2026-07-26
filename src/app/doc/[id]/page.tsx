import { notFound } from 'next/navigation'
import {
  obterDocumentoPublico,
  registrarVisualizacaoPublica,
  urlVisualizacaoPublica,
} from '@/lib/documentos/acoes'
import { VisualizadorDocumentoPublico } from '@/components/documentos/VisualizadorDocumentoPublico'

export const metadata = { title: 'Documento · VIGMED' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function PaginaDocumentoPublico({ params }: Props) {
  const { id } = await params
  const resultado = await obterDocumentoPublico(id)

  if (resultado.privado && resultado.motivo === 'nao_encontrado') {
    notFound()
  }

  if (resultado.privado) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--color-surface-2)] px-4">
        <div className="max-w-md w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <h1 className="text-lg font-semibold text-[var(--color-text-1)]">Documento privado</h1>
          <p className="mt-2 text-sm text-[var(--color-text-2)]">
            {resultado.titulo
              ? `“${resultado.titulo}” não está disponível para visualização pública.`
              : 'Este arquivo não está disponível para visualização pública.'}
          </p>
          <p className="mt-4 text-xs text-[var(--color-text-3)]">
            O compartilhamento externo foi desativado ou o link expirou.
          </p>
        </div>
      </main>
    )
  }

  await registrarVisualizacaoPublica(id)
  const { url, erro } = await urlVisualizacaoPublica(id)

  if (erro || !url) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--color-surface-2)] px-4">
        <p className="text-sm text-[var(--color-text-2)]">{erro ?? 'Não foi possível carregar o arquivo.'}</p>
      </main>
    )
  }

  const doc = resultado.documento
  return (
    <VisualizadorDocumentoPublico
      titulo={doc.titulo}
      nomeArquivo={doc.nome_arquivo}
      tipoMime={doc.tipo_mime}
      url={url}
    />
  )
}
