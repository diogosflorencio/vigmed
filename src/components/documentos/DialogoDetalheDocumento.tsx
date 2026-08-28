'use client'

import { Modal } from '@/components/vig/Modal'
import { Botao } from '@/components/vig/Botao'
import { Selo } from '@/components/vig/Selo'
import { CheckboxInline } from '@/components/vig/Checkbox'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { SeletorEmpresasUpload } from '@/components/documentos/SeletorEmpresasUpload'
import {
  alternarCompartilhamentoDocumento,
  atualizarEmpresasDocumento,
  excluirDocumento,
  obterDocumentoDetalhe,
  obterUrlPreviewDocumento,
} from '@/lib/documentos/acoes'
import { ROTAS } from '@/lib/rotas'
import { cn, formatarBytes, formatarData } from '@/lib/utils'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface DocumentoResumo {
  id: string
  titulo: string
  nome_arquivo: string
  tamanho_arquivo?: number
  total_downloads: number
  total_visualizacoes?: number
  valido_ate: string | null
  criado_em: string
  origem_publicacao?: 'admin' | 'empresa'
  permitir_compartilhar?: boolean
  enviado_por?: string | null
}

interface Props {
  documento: DocumentoResumo | null
  aberto: boolean
  onFechar: () => void
  empresas: { id: string; nome_fantasia: string }[]
  modo: 'adm' | 'docs'
  perfilId?: string
}

export function DialogoDetalheDocumento({
  documento,
  aberto,
  onFechar,
  empresas,
  modo,
  perfilId,
}: Props) {
  const router = useRouter()
  const [carregando, definirCarregando] = useState(false)
  const [previewUrl, definirPreviewUrl] = useState<string | null>(null)
  const [tipoMime, definirTipoMime] = useState('')
  const [empresaIds, definirEmpresaIds] = useState<string[]>([])
  const [detalhe, definirDetalhe] = useState<Record<string, unknown> | null>(null)
  const [processando, iniciarProcessamento] = useTransition()

  useEffect(() => {
    if (!aberto || !documento) {
      definirPreviewUrl(null)
      definirDetalhe(null)
      return
    }

    let ativo = true
    definirCarregando(true)

    Promise.all([
      obterDocumentoDetalhe(documento.id),
      obterUrlPreviewDocumento(documento.id),
    ]).then(([det, prev]) => {
      if (!ativo) return
      if ('documento' in det && det.documento) {
        definirDetalhe(det.documento as Record<string, unknown>)
        definirEmpresaIds((det.documento.empresa_ids as string[]) ?? [])
      }
      if ('url' in prev && prev.url) {
        definirPreviewUrl(prev.url)
        definirTipoMime(prev.tipoMime ?? '')
      }
      definirCarregando(false)
    })

    return () => {
      ativo = false
    }
  }, [aberto, documento])

  if (!documento) return null

  const podeExcluir =
    modo === 'adm' || (documento.enviado_por === perfilId && documento.origem_publicacao === 'empresa')

  const ehPdf = tipoMime === 'application/pdf' || documento.nome_arquivo.toLowerCase().endsWith('.pdf')
  const ehImagem = tipoMime.startsWith('image/')

  function urlCompartilhamento() {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
      `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vigmed.com.br'}`
    return `${base}${ROTAS.doc.arquivo(documento!.id)}`
  }

  async function baixar() {
    const res = await fetch('/api/download/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentoId: documento!.id }),
    })
    const dados = await res.json()
    if (!res.ok) {
      toast.error(dados.erro ?? 'Erro ao baixar.')
      return
    }
    window.open(dados.urlDownload, '_blank')
  }

  function copiarLink() {
    navigator.clipboard.writeText(urlCompartilhamento()).then(
      () => toast.success('Link copiado.'),
      () => toast.error('Não foi possível copiar.'),
    )
  }

  function salvarEmpresas() {
    iniciarProcessamento(async () => {
      const r = await atualizarEmpresasDocumento(documento!.id, empresaIds)
      if (r.erro) {
        toast.error(r.erro)
        return
      }
      toast.success('Empresas atualizadas.')
      router.refresh()
    })
  }

  function alternarPublico(permitir: boolean) {
    iniciarProcessamento(async () => {
      const r = await alternarCompartilhamentoDocumento(documento!.id, permitir)
      if (r.erro) {
        toast.error(r.erro)
        return
      }
      toast.success(permitir ? 'Link público ativado.' : 'Link público desativado.')
      router.refresh()
    })
  }

  function excluir() {
    if (!confirm(`Excluir "${documento!.titulo}"?`)) return
    iniciarProcessamento(async () => {
      const r = await excluirDocumento(documento!.id)
      if (r.erro) {
        toast.error(r.erro)
        return
      }
      toast.success('Documento excluído.')
      onFechar()
      router.refresh()
    })
  }

  const enviadoPor = detalhe?.enviado_por_perfil as { nome_completo: string; email: string } | null | undefined
  const visualizacoes = (detalhe?.total_visualizacoes as number) ?? documento.total_visualizacoes ?? 0

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={documento.titulo}
      largo
      className="vig-modal--documento"
      rodape={
        <>
          <Botao variante="secundario" onClick={baixar} filho="Baixar" />
          {podeExcluir && (
            <Botao
              variante="fantasma"
              className={cn('text-[#b42318]')}
              carregando={processando}
              onClick={excluir}
              filho="Excluir"
            />
          )}
          <Botao variante="primario" onClick={onFechar} filho="Fechar" />
        </>
      }
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2 text-xs items-center">
          <Selo variante="padrao">{documento.nome_arquivo}</Selo>
          {documento.tamanho_arquivo != null && (
            <Selo variante="padrao">{formatarBytes(documento.tamanho_arquivo)}</Selo>
          )}
          <Selo variante={documento.origem_publicacao === 'empresa' ? 'padrao' : 'sucesso'}>
            {documento.origem_publicacao === 'empresa' ? 'Empresa' : 'VIGMED'}
          </Selo>
          <span className="text-[var(--color-text-3)]">{formatarData(documento.criado_em)}</span>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 text-sm">
          <div>
            <span className="text-[var(--color-text-3)]">Visualizações</span>
            <p className="font-medium">{visualizacoes}</p>
          </div>
          <div>
            <span className="text-[var(--color-text-3)]">Downloads</span>
            <p className="font-medium">{documento.total_downloads}</p>
          </div>
          <div>
            <span className="text-[var(--color-text-3)]">Enviado por</span>
            <p className="font-medium truncate">{enviadoPor?.nome_completo ?? '-'}</p>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] min-h-[200px] overflow-hidden">
          {carregando ? (
            <div className="flex h-48 items-center justify-center text-sm text-[var(--color-text-3)]">
              Carregando preview...
            </div>
          ) : previewUrl && ehPdf ? (
            <iframe src={previewUrl} title={documento.titulo} className="h-64 w-full bg-white" />
          ) : previewUrl && ehImagem ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={documento.titulo} className="max-h-64 w-full object-contain" />
          ) : (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-[var(--color-text-3)]">
              <IconeAnimado nome="file-text" tamanho={24} />
              Preview indisponível para este tipo.
            </div>
          )}
        </div>

        <div className="rounded-lg border border-[var(--color-border)] p-3">
          <CheckboxInline
            rotulo={`Permitir visualização pública em ${urlCompartilhamento().replace(/^https?:\/\//, '')}`}
            checked={!!documento.permitir_compartilhar}
            disabled={processando}
            onChange={(e) => alternarPublico(e.target.checked)}
          />
          {documento.permitir_compartilhar && (
            <Botao
              variante="fantasma"
              tamanho="sm"
              className="mt-2 h-7 text-xs"
              onClick={copiarLink}
              filho="Copiar link público"
            />
          )}
        </div>

        {modo === 'adm' && (
          <div>
            <p className="text-sm font-medium text-[var(--color-text-1)] mb-2">
              Empresas com acesso (um arquivo, várias empresas)
            </p>
            <SeletorEmpresasUpload
              empresas={empresas}
              selecionadas={empresaIds}
              onChange={definirEmpresaIds}
              titulo="Compartilhar com empresas"
            />
            <Botao
              variante="secundario"
              tamanho="sm"
              className="mt-2"
              carregando={processando}
              onClick={salvarEmpresas}
              filho="Salvar empresas"
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
