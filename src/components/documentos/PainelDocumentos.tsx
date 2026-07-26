'use client'

import { useCallback, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { IconeAnimado } from '@/components/ui/icone-animado'
import toast from 'react-hot-toast'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { Badge, Button } from '@/components/ui'
import { alternarCompartilhamentoDocumento, excluirDocumento } from '@/lib/documentos/acoes'
import { ROTAS } from '@/lib/rotas'
import { cn, formatarBytes, formatarData } from '@/lib/utils'

interface DocumentoItem {
  id: string
  titulo: string
  nome_arquivo: string
  tamanho_arquivo?: number
  total_downloads: number
  total_visualizacoes?: number
  valido_ate: string | null
  criado_em: string
  categoria_id?: string | null
  origem_publicacao?: 'admin' | 'empresa'
  permitir_compartilhar?: boolean
  enviado_por?: string | null
  categorias?: { nome: string } | null
  documento_empresas?: { empresa_id?: string; empresas?: { nome_fantasia: string } | null }[]
}

interface Props {
  documentos: DocumentoItem[]
  empresas: { id: string; nome_fantasia: string }[]
  categorias: { id: string; nome: string }[]
  modo: 'adm' | 'docs'
  perfilId?: string
}

export function PainelDocumentos({ documentos, empresas, categorias, modo, perfilId }: Props) {
  const router = useRouter()
  const [busca, definirBusca] = useState('')
  const [empresaId, definirEmpresaId] = useState('')
  const [categoriaId, definirCategoriaId] = useState('')
  const [empresasUpload, definirEmpresasUpload] = useState<string[]>([])
  const [mostrarSelecaoEmpresas, definirMostrarSelecaoEmpresas] = useState(false)
  const [arrastando, definirArrastando] = useState(false)
  const [enviando, iniciarEnvio] = useTransition()
  const [processando, iniciarProcessamento] = useTransition()
  const mostrarStats = modo === 'adm'

  const filtrados = useMemo(() => {
    return documentos.filter((d) => {
      if (busca && !d.titulo.toLowerCase().includes(busca.toLowerCase())) return false
      if (categoriaId && d.categoria_id !== categoriaId) return false
      if (empresaId && modo === 'adm') {
        const vinculos = d.documento_empresas ?? []
        if (!vinculos.some((v) => v.empresa_id === empresaId)) return false
      }
      return true
    })
  }, [documentos, busca, empresaId, categoriaId, modo])

  const enviarArquivo = useCallback(
    (arquivo: File) => {
      if (!arquivo) return

      if (modo === 'adm' && empresasUpload.length === 0) {
        toast.error('Selecione ao menos uma empresa para o upload.')
        definirMostrarSelecaoEmpresas(true)
        return
      }

      iniciarEnvio(async () => {
        try {
          const res = await fetch('/api/upload/presign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nomeArquivo: arquivo.name,
              tipoMime: arquivo.type || 'application/octet-stream',
              tamanho: arquivo.size,
              titulo: arquivo.name.replace(/\.[^.]+$/, ''),
              empresaIds: modo === 'adm' ? empresasUpload : undefined,
              categoriaId: categoriaId || undefined,
            }),
          })
          const dados = await res.json()
          if (!res.ok) {
            toast.error(dados.erro ?? 'Erro no upload.')
            return
          }
          const put = await fetch(dados.urlUpload, {
            method: 'PUT',
            headers: { 'Content-Type': arquivo.type || 'application/octet-stream' },
            body: arquivo,
          })
          if (!put.ok) {
            toast.error('Falha ao enviar arquivo ao armazenamento. Verifique CORS do bucket R2.')
            return
          }
          toast.success('Documento enviado com sucesso.')
          router.refresh()
        } catch {
          toast.error('Falha ao enviar arquivo.')
        }
      })
    },
    [empresasUpload, categoriaId, modo, router],
  )

  async function baixar(documentoId: string) {
    const res = await fetch('/api/download/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentoId }),
    })
    const dados = await res.json()
    if (!res.ok) {
      toast.error(dados.erro ?? 'Erro ao baixar.')
      return
    }
    window.open(dados.urlDownload, '_blank')
  }

  function alternarEmpresaUpload(id: string) {
    definirEmpresasUpload((atual) =>
      atual.includes(id) ? atual.filter((e) => e !== id) : [...atual, id],
    )
  }

  function urlCompartilhamento(documentoId: string) {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
      `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vigmed.com.br'}`
    return `${base}${ROTAS.doc.arquivo(documentoId)}`
  }

  function copiarLinkCompartilhamento(documentoId: string) {
    const url = urlCompartilhamento(documentoId)
    navigator.clipboard.writeText(url).then(
      () => toast.success('Link copiado.'),
      () => toast.error('Não foi possível copiar o link.'),
    )
  }

  function excluir(documentoId: string, titulo: string) {
    if (!confirm(`Excluir “${titulo}”? Esta ação não pode ser desfeita.`)) return
    iniciarProcessamento(async () => {
      const resultado = await excluirDocumento(documentoId)
      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      toast.success('Documento excluído.')
      router.refresh()
    })
  }

  function alternarCompartilhamento(documentoId: string, permitir: boolean) {
    iniciarProcessamento(async () => {
      const resultado = await alternarCompartilhamentoDocumento(documentoId, permitir)
      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      toast.success(permitir ? 'Compartilhamento ativado.' : 'Compartilhamento desativado.')
      router.refresh()
    })
  }

  function podeExcluir(doc: DocumentoItem) {
    if (modo === 'adm') return true
    return doc.enviado_por === perfilId && doc.origem_publicacao === 'empresa'
  }

  function nomesEmpresas(doc: DocumentoItem) {
    const nomes = (doc.documento_empresas ?? [])
      .map((v) => v.empresas?.nome_fantasia)
      .filter(Boolean) as string[]
    return nomes.length ? nomes.join(', ') : '-'
  }

  return (
    <SecaoPainel>
      <CabecalhoPagina
        titulo="Documentos"
        descricao={
          modo === 'adm'
            ? 'Envie arquivos para uma ou várias empresas, acompanhe acessos e compartilhamento.'
            : 'Publique e acesse os arquivos da sua empresa.'
        }
        acoes={
          <label className="cursor-pointer">
            <Button variant="primary" size="sm" loading={enviando} render={<span />}>
              <IconeAnimado nome="cloud-upload" tamanho={15} />
              Enviar arquivo
            </Button>
            <input
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && enviarArquivo(e.target.files[0])}
            />
          </label>
        }
      />

      {modo === 'adm' && (
        <RevelarScroll>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 mb-4">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => definirMostrarSelecaoEmpresas((v) => !v)}
            >
              <span className="text-sm font-medium text-[var(--color-text-1)]">
                Empresas destino do upload
                {empresasUpload.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-[var(--color-text-3)]">
                    ({empresasUpload.length} selecionada{empresasUpload.length > 1 ? 's' : ''})
                  </span>
                )}
              </span>
              <IconeAnimado nome={mostrarSelecaoEmpresas ? 'chevron-up' : 'chevron-down'} tamanho={14} />
            </button>
            {mostrarSelecaoEmpresas && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {empresas.map((e) => (
                  <label key={e.id} className="flex items-center gap-2 text-sm text-[var(--color-text-2)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={empresasUpload.includes(e.id)}
                      onChange={() => alternarEmpresaUpload(e.id)}
                    />
                    {e.nome_fantasia}
                  </label>
                ))}
              </div>
            )}
            {empresasUpload.length === 0 && (
              <p className="mt-2 text-xs text-[var(--color-warning)]">
                Selecione ao menos uma empresa antes de enviar arquivos.
              </p>
            )}
          </div>
        </RevelarScroll>
      )}

      <RevelarScroll>
        <div className="painel-filtros">
          <div className="painel-busca" style={{ minWidth: 180 }}>
            <IconeAnimado nome="search" tamanho={13} className="painel-busca-icone" />
            <input
              className="painel-busca-input"
              placeholder="Buscar por título..."
              value={busca}
              onChange={(e) => definirBusca(e.target.value)}
            />
          </div>
          {modo === 'adm' && (
            <>
              <select className="painel-select" value={empresaId} onChange={(e) => definirEmpresaId(e.target.value)}>
                <option value="">Todas as empresas</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome_fantasia}
                  </option>
                ))}
              </select>
              <select className="painel-select" value={categoriaId} onChange={(e) => definirCategoriaId(e.target.value)}>
                <option value="">Todas as categorias</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </RevelarScroll>

      <RevelarScroll atraso={0.05}>
        <div
          className={cn('painel-dropzone', arrastando && 'painel-dropzone--ativo')}
          onDragOver={(e) => {
            e.preventDefault()
            definirArrastando(true)
          }}
          onDragLeave={() => definirArrastando(false)}
          onDrop={(e) => {
            e.preventDefault()
            definirArrastando(false)
            const f = e.dataTransfer.files[0]
            if (f) enviarArquivo(f)
          }}
          onClick={() => document.getElementById('upload-input-docs')?.click()}
        >
          <IconeAnimado nome="cloud-upload" tamanho={14} />
          Arraste um arquivo ou clique para enviar. PDF, DOCX e planilhas até 50 MB.
          <input
            id="upload-input-docs"
            type="file"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && enviarArquivo(e.target.files[0])}
          />
        </div>
      </RevelarScroll>

      <RevelarScroll atraso={0.08}>
        <div className="painel-tabela-wrap">
          <div className="overflow-x-auto">
            <table className="painel-tabela">
              <thead className="painel-tabela-thead">
                <tr>
                  <th>Documento</th>
                  {modo === 'adm' && <th className="hidden md:table-cell">Empresas</th>}
                  <th className="hidden sm:table-cell">Categoria</th>
                  {mostrarStats && <th className="hidden lg:table-cell">Origem</th>}
                  <th className="hidden sm:table-cell">Tamanho</th>
                  {mostrarStats && <th className="hidden xl:table-cell">Validade</th>}
                  {mostrarStats && <th className="hidden lg:table-cell">Views</th>}
                  {mostrarStats && <th className="hidden xl:table-cell">Downloads</th>}
                  <th className="hidden md:table-cell">Compartilhar</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="painel-tabela-tbody">
                {filtrados.map((doc) => {
                  const vencido = doc.valido_ate && new Date(doc.valido_ate) < new Date()
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <IconeAnimado nome="file-text" tamanho={14} className="shrink-0 text-(--color-text-3)" />
                          <div>
                            <span className="tabela-nome">{doc.titulo}</span>
                            <span className="tabela-sub">{formatarData(doc.criado_em)}</span>
                          </div>
                        </div>
                      </td>
                      {modo === 'adm' && (
                        <td className="hidden md:table-cell">
                          <span className="flex items-center gap-1 tabela-mono text-xs">{nomesEmpresas(doc)}</span>
                        </td>
                      )}
                      <td className="hidden sm:table-cell">
                        {doc.categorias ? (
                          <Badge variant="default" className="text-[10px] py-0">
                            {doc.categorias.nome}
                          </Badge>
                        ) : (
                          <span className="tabela-mono">-</span>
                        )}
                      </td>
                      {mostrarStats && (
                        <td className="hidden lg:table-cell">
                          <Badge
                            variant={doc.origem_publicacao === 'empresa' ? 'default' : 'success'}
                            className="text-[10px] py-0"
                          >
                            {doc.origem_publicacao === 'empresa' ? 'Empresa' : 'VIGMED'}
                          </Badge>
                        </td>
                      )}
                      <td className="hidden sm:table-cell tabela-mono">
                        {doc.tamanho_arquivo ? formatarBytes(doc.tamanho_arquivo) : '-'}
                      </td>
                      {mostrarStats && (
                        <td className={cn('hidden xl:table-cell tabela-mono', vencido && 'text-(--color-danger)')}>
                          {doc.valido_ate ? formatarData(doc.valido_ate) : '-'}
                        </td>
                      )}
                      {mostrarStats && (
                        <td className="hidden lg:table-cell tabela-mono">{doc.total_visualizacoes ?? 0}</td>
                      )}
                      {mostrarStats && (
                        <td className="hidden xl:table-cell">
                          <span className="flex items-center gap-1 tabela-mono">
                            <IconeAnimado nome="download" tamanho={11} /> {doc.total_downloads}
                          </span>
                        </td>
                      )}
                      <td className="hidden md:table-cell">
                        <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!doc.permitir_compartilhar}
                            disabled={processando}
                            onChange={(e) => alternarCompartilhamento(doc.id, e.target.checked)}
                          />
                          {doc.permitir_compartilhar ? 'Público' : 'Privado'}
                        </label>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => baixar(doc.id)}>
                            Baixar
                          </Button>
                          {doc.permitir_compartilhar && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => copiarLinkCompartilhamento(doc.id)}
                            >
                              Link
                            </Button>
                          )}
                          {podeExcluir(doc) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-(--color-danger)"
                              disabled={processando}
                              onClick={() => excluir(doc.id, doc.titulo)}
                            >
                              Excluir
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filtrados.length === 0 && (
            <div className="painel-vazio">
              <IconeAnimado nome="file-text" tamanho={22} className="opacity-40" />
              Nenhum documento encontrado.
            </div>
          )}
        </div>
      </RevelarScroll>
    </SecaoPainel>
  )
}
