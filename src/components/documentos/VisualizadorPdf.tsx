'use client'

import { useEffect, useRef, useState } from 'react'
import { Botao } from '@/components/vig/Botao'
import { cn } from '@/lib/utils'

interface Props {
  url: string
  titulo: string
  onBaixar?: () => void
  className?: string
}

/** Visualizador PDF próprio (pdf.js), sem o chrome do navegador */
export function VisualizadorPdf({ url, titulo, onBaixar, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pdfRef = useRef<{ numPages: number; getPage: (n: number) => Promise<unknown>; destroy: () => void } | null>(
    null,
  )
  const [pagina, definirPagina] = useState(1)
  const [total, definirTotal] = useState(0)
  const [escala, definirEscala] = useState(1.2)
  const [carregando, definirCarregando] = useState(true)
  const [renderizando, definirRenderizando] = useState(false)
  const [erro, definirErro] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      definirCarregando(true)
      definirErro(null)
      definirTotal(0)
      definirPagina(1)
      try {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString()

        const doc = await pdfjs.getDocument({ url }).promise
        if (cancelado) {
          void doc.destroy()
          return
        }
        pdfRef.current = doc as unknown as typeof pdfRef.current
        definirTotal(doc.numPages)
      } catch {
        if (!cancelado) definirErro('Não foi possível renderizar este PDF.')
      } finally {
        if (!cancelado) definirCarregando(false)
      }
    }

    void carregar()

    return () => {
      cancelado = true
      pdfRef.current?.destroy()
      pdfRef.current = null
    }
  }, [url])

  useEffect(() => {
    const pdf = pdfRef.current
    const canvas = canvasRef.current
    if (!pdf || !canvas || total < 1 || carregando) return

    let cancelado = false

    async function renderizar() {
      definirRenderizando(true)
      try {
        const page = (await pdf!.getPage(pagina)) as {
          getViewport: (o: { scale: number }) => { width: number; height: number }
          render: (o: {
            canvasContext: CanvasRenderingContext2D
            viewport: { width: number; height: number }
            canvas: HTMLCanvasElement
          }) => { promise: Promise<void> }
        }
        if (cancelado) return

        const viewport = page.getViewport({ scale: escala })
        const ctx = canvas!.getContext('2d')
        if (!ctx) return
        canvas!.width = Math.floor(viewport.width)
        canvas!.height = Math.floor(viewport.height)
        await page.render({ canvasContext: ctx, viewport, canvas: canvas! }).promise
      } catch {
        if (!cancelado) definirErro('Falha ao desenhar a página.')
      } finally {
        if (!cancelado) definirRenderizando(false)
      }
    }

    void renderizar()
    return () => {
      cancelado = true
    }
  }, [pagina, escala, total, carregando])

  return (
    <div className={cn('vm-pdf', className)} ref={containerRef}>
      <div className="vm-pdf-toolbar">
        <p className="vm-pdf-titulo" title={titulo}>
          {titulo}
        </p>
        <div className="vm-pdf-acoes">
          <button
            type="button"
            className="vm-pdf-btn"
            disabled={pagina <= 1 || carregando}
            onClick={() => definirPagina((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span className="vm-pdf-pagina">
            {total > 0 ? `${pagina} / ${total}` : '...'}
          </span>
          <button
            type="button"
            className="vm-pdf-btn"
            disabled={pagina >= total || carregando}
            onClick={() => definirPagina((p) => Math.min(total, p + 1))}
          >
            Próxima
          </button>
          <button
            type="button"
            className="vm-pdf-btn"
            disabled={escala <= 0.7}
            onClick={() => definirEscala((e) => Math.max(0.7, Number((e - 0.15).toFixed(2))))}
          >
            -
          </button>
          <button
            type="button"
            className="vm-pdf-btn"
            disabled={escala >= 2.2}
            onClick={() => definirEscala((e) => Math.min(2.2, Number((e + 0.15).toFixed(2))))}
          >
            +
          </button>
          {onBaixar && (
            <Botao variante="secundario" tamanho="sm" onClick={onBaixar} filho="Baixar" />
          )}
          <a className="vm-pdf-btn vm-pdf-btn--link" href={url} target="_blank" rel="noopener noreferrer">
            Nova aba
          </a>
        </div>
      </div>

      <div className="vm-pdf-palco">
        {carregando && <p className="vm-pdf-status">Abrindo documento...</p>}
        {erro && (
          <div className="vm-pdf-status">
            <p>{erro}</p>
            <a href={url} target="_blank" rel="noopener noreferrer">
              Abrir arquivo
            </a>
          </div>
        )}
        {!carregando && !erro && (
          <div className={cn('vm-pdf-folha', renderizando && 'vm-pdf-folha--render')}>
            <canvas ref={canvasRef} />
          </div>
        )}
      </div>
    </div>
  )
}
