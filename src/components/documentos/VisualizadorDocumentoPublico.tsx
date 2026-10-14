'use client'

import { IconeAnimado } from '@/components/ui/icone-animado'
import { VisualizadorPdf } from '@/components/documentos/VisualizadorPdf'

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
    <div className="vm-doc-publico">
      <header className="vm-doc-publico-topo">
        <div className="vm-doc-publico-marca">
          <p>VIGMED</p>
          <h1>{titulo}</h1>
          <span>{nomeArquivo}</span>
        </div>
        <a href={url} download={nomeArquivo} className="vm-pdf-btn vm-pdf-btn--link">
          <IconeAnimado nome="download" tamanho={14} />
          Baixar
        </a>
      </header>

      <div className="vm-doc-publico-corpo">
        {ehPdf ? (
          <VisualizadorPdf url={url} titulo={titulo} />
        ) : ehImagem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={titulo} className="vm-doc-imagem" />
        ) : (
          <div className="vm-doc-viewer-vazio">
            <IconeAnimado nome="file-text" tamanho={28} />
            <p>Visualização inline não disponível para este tipo de arquivo.</p>
            <a href={url} download={nomeArquivo}>
              Baixar arquivo
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
