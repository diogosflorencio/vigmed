'use client'

import { IconeAnimado } from '@/components/ui/icone-animado'

interface Props {
  titulo: string
  nomeArquivo: string
  tipoMime: string
  url: string
}

export function VisualizadorDocumentoPublico({ titulo, nomeArquivo, tipoMime, url }: Props) {
  const ehPdf = tipoMime === 'application/pdf' || nomeArquivo.toLowerCase().endsWith('.pdf')
  const ehImagem = tipoMime.startsWith('image/')

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface-2)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-[var(--color-text-3)] uppercase tracking-wide">VIGMED</p>
            <h1 className="truncate text-base font-semibold text-[var(--color-text-1)]">{titulo}</h1>
            <p className="truncate text-xs text-[var(--color-text-3)]">{nomeArquivo}</p>
          </div>
          <a
            href={url}
            download={nomeArquivo}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-1)] hover:bg-[var(--color-surface-2)]"
          >
            <IconeAnimado nome="download" tamanho={14} />
            Baixar
          </a>
        </div>
      </header>

      <div className="flex-1 mx-auto w-full max-w-5xl p-4">
        {ehPdf ? (
          <iframe
            src={url}
            title={titulo}
            className="h-[calc(100vh-5.5rem)] w-full rounded-lg border border-[var(--color-border)] bg-white"
          />
        ) : ehImagem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={titulo}
            className="mx-auto max-h-[calc(100vh-5.5rem)] max-w-full rounded-lg border border-[var(--color-border)] object-contain"
          />
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <IconeAnimado nome="file-text" tamanho={28} className="text-[var(--color-text-3)]" />
            <p className="text-sm text-[var(--color-text-2)]">Visualização inline não disponível para este tipo de arquivo.</p>
            <a
              href={url}
              download={nomeArquivo}
              className="text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Baixar arquivo
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
