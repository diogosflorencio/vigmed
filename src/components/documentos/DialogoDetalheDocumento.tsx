'use client'

import { Botao } from '@/components/vig/Botao'
import { Campo } from '@/components/vig/Campo'
import { Selo } from '@/components/vig/Selo'
import { CheckboxInline } from '@/components/vig/Checkbox'
import { Confirm } from '@/components/ui/confirmar'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { SeletorEmpresasUpload } from '@/components/documentos/SeletorEmpresasUpload'
import { VisualizadorPdf } from '@/components/documentos/VisualizadorPdf'
import {
  alternarCompartilhamentoDocumento,
  atualizarEmpresasDocumento,
  atualizarValidadeDocumento,
  atualizarTituloDocumento,
  prorrogarValidadeDocumento,
  excluirDocumento,
  obterDocumentoDetalhe,
  obterUrlPreviewDocumento,
} from '@/lib/documentos/acoes'
import {
  rotuloStatusValidade,
  statusValidade,
  varianteSeloValidade,
} from '@/lib/documentos/validade'
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
  const [validoAte, definirValidoAte] = useState('')
  const [tituloEditavel, definirTituloEditavel] = useState('')
  const [processando, iniciarProcessamento] = useTransition()
  const [confirmarExclusao, definirConfirmarExclusao] = useState(false)

  useEffect(() => {
    if (documento) definirTituloEditavel(documento.titulo)
  }, [documento?.id, documento?.titulo])

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
        const va = det.documento.valido_ate as string | null
        definirValidoAte(va ?? '')
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

  function salvarTitulo() {
    iniciarProcessamento(async () => {
      const r = await atualizarTituloDocumento(documento!.id, tituloEditavel)
      if (r.erro) {
        toast.error(r.erro)
        return
      }
      if (r.titulo) definirTituloEditavel(r.titulo)
      toast.success('Título atualizado.')
      router.refresh()
    })
  }

  function salvarValidade() {
    iniciarProcessamento(async () => {
      const r = await atualizarValidadeDocumento(documento!.id, validoAte || null)
      if (r.erro) {
        toast.error(r.erro)
        return
      }
      toast.success(validoAte ? 'Validade atualizada.' : 'Validade removida.')
      router.refresh()
    })
  }

  function prorrogar(dias: number) {
    iniciarProcessamento(async () => {
      const r = await prorrogarValidadeDocumento(documento!.id, dias)
      if (r.erro) {
        toast.error(r.erro)
        return
      }
      if (r.valido_ate) definirValidoAte(r.valido_ate)
      toast.success(`Validade prorrogada em ${dias} dias.`)
      router.refresh()
    })
  }

  function excluir() {
    definirConfirmarExclusao(true)
  }

  function executarExclusao() {
    iniciarProcessamento(async () => {
      const r = await excluirDocumento(documento!.id)
      if (r.erro) {
        toast.error(r.erro)
        return
      }
      toast.success('Documento excluído.')
      definirConfirmarExclusao(false)
      onFechar()
      router.refresh()
    })
  }

  const enviadoPor = detalhe?.enviado_por_perfil as { nome_completo: string; email: string } | null | undefined
  const visualizacoes = (detalhe?.total_visualizacoes as number) ?? documento.total_visualizacoes ?? 0
  const statusVal = statusValidade(documento.valido_ate)

  if (!aberto) return null

  return (
    <>
      <section className="vm-doc-painel" aria-label={tituloEditavel || documento.titulo}>
        <header className="vm-doc-painel-topo">
          <div>
            <p className="vm-doc-painel-kicker">Documento</p>
            <h2>{tituloEditavel || documento.titulo}</h2>
          </div>
          <div className="vm-doc-painel-acoes">
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
            <Botao variante="primario" onClick={onFechar} filho="Voltar à lista" />
          </div>
        </header>

      <div className="vm-doc-detalhe">
        <aside className="vm-doc-detalhe-meta">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <Campo
              rotulo="Título do documento"
              value={tituloEditavel}
              onChange={(e) => definirTituloEditavel(e.target.value)}
              hint="Nome exibido na listagem e nos e-mails de alerta."
            />
            <Botao
              variante="secundario"
              tamanho="sm"
              carregando={processando}
              disabled={!tituloEditavel.trim() || tituloEditavel.trim() === documento.titulo}
              onClick={salvarTitulo}
              filho="Salvar título"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs items-center">
            <Selo variante="padrao">{documento.nome_arquivo}</Selo>
            {documento.tamanho_arquivo != null && (
              <Selo variante="padrao">{formatarBytes(documento.tamanho_arquivo)}</Selo>
            )}
            <Selo variante={documento.origem_publicacao === 'empresa' ? 'padrao' : 'sucesso'}>
              {documento.origem_publicacao === 'empresa' ? 'Empresa' : 'VIGMED'}
            </Selo>
            {statusVal !== 'indefinido' && (
              <Selo variante={varianteSeloValidade(statusVal)}>{rotuloStatusValidade(statusVal)}</Selo>
            )}
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

          <div className="vm-doc-bloco grid gap-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <Campo
                rotulo="Validade do documento"
                type="date"
                value={validoAte}
                onChange={(e) => definirValidoAte(e.target.value)}
                hint="Deixe vazio para documento sem prazo definido."
              />
              <Botao
                variante="secundario"
                tamanho="sm"
                carregando={processando}
                onClick={salvarValidade}
                filho="Salvar validade"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-[var(--color-text-3)] w-full sm:w-auto">Prorrogar:</span>
              <Botao variante="fantasma" tamanho="sm" disabled={processando} onClick={() => prorrogar(30)} filho="+30 dias" />
              <Botao variante="fantasma" tamanho="sm" disabled={processando} onClick={() => prorrogar(90)} filho="+90 dias" />
              <Botao variante="fantasma" tamanho="sm" disabled={processando} onClick={() => prorrogar(365)} filho="+1 ano" />
            </div>
          </div>

          <div className="vm-doc-bloco">
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
            <div className="vm-doc-bloco">
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
        </aside>

        <section className="vm-doc-detalhe-viewer" aria-label="Visualização do arquivo">
          {carregando ? (
            <div className="vm-doc-viewer-vazio">Carregando arquivo...</div>
          ) : previewUrl && ehPdf ? (
            <VisualizadorPdf
              url={previewUrl}
              titulo={tituloEditavel || documento.titulo}
              onBaixar={() => void baixar()}
            />
          ) : previewUrl && ehImagem ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={documento.titulo} className="vm-doc-imagem" />
          ) : (
            <div className="vm-doc-viewer-vazio">
              <IconeAnimado nome="file-text" tamanho={28} />
              <p>Preview indisponível para este tipo.</p>
              <Botao variante="secundario" tamanho="sm" onClick={baixar} filho="Baixar arquivo" />
            </div>
          )}
        </section>
      </div>
      </section>

    <Confirm
      open={confirmarExclusao}
      onClose={() => definirConfirmarExclusao(false)}
      onConfirm={executarExclusao}
      title="Excluir documento"
      message={`Excluir "${documento.titulo}"?`}
      confirmLabel="Excluir"
      loading={processando}
    />
  </>
  )
}
