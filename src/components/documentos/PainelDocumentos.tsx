'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAtalhoBusca } from '@/hooks/use-atalho-busca'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { Botao } from '@/components/vig/Botao'
import { Campo } from '@/components/vig/Campo'
import { Vazio } from '@/components/vig/Vazio'
import { DialogoDetalheDocumento } from '@/components/documentos/DialogoDetalheDocumento'
import { SeletorEmpresasUpload } from '@/components/documentos/SeletorEmpresasUpload'
import { cn, formatarBytes, formatarData } from '@/lib/utils'
import {
  rotuloStatusValidade,
  statusValidade,
} from '@/lib/documentos/validade'
import { prorrogarValidadeEmLote } from '@/lib/documentos/acoes'

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
  empresas: { id: string; nome_fantasia: string; armazenamento_limite?: number; consumoEmpresa?: number }[]
  categorias: { id: string; nome: string }[]
  modo: 'adm' | 'docs'
  perfilId?: string
  empresaFixa?: { id: string; nome: string }
  tituloPagina?: string
  descricaoPagina?: string
  cota?: { usado: number; limite: number } | null
}

function lerFiltroValidade(v: string | null): 'todos' | 'vencendo' | 'vencido' {
  if (v === 'vencendo' || v === 'vencido') return v
  return 'todos'
}

function lerOrdenacao(v: string | null): 'recente' | 'antigo' | 'validade' {
  if (v === 'antigo' || v === 'validade') return v
  return 'recente'
}

function classeStatus(st: ReturnType<typeof statusValidade>) {
  if (st === 'vencido') return 'docs-status docs-status--vencido'
  if (st === 'vencendo') return 'docs-status docs-status--vencendo'
  if (st === 'ok') return 'docs-status docs-status--ok'
  return 'docs-status'
}

export function PainelDocumentos({
  documentos,
  empresas,
  categorias,
  modo,
  perfilId,
  empresaFixa,
  tituloPagina,
  descricaoPagina,
  cota,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [busca, definirBusca] = useState(() => searchParams.get('q') ?? '')
  const [empresaId, definirEmpresaId] = useState(() => searchParams.get('empresa') ?? empresaFixa?.id ?? '')
  const [categoriaId, definirCategoriaId] = useState(() => searchParams.get('categoria') ?? '')
  const [filtroValidade, definirFiltroValidade] = useState(() =>
    lerFiltroValidade(searchParams.get('validade')),
  )
  const [ordenacao, definirOrdenacao] = useState(() => lerOrdenacao(searchParams.get('ordem')))
  const [validoAteUpload, definirValidoAteUpload] = useState('')
  const [empresasUpload, definirEmpresasUpload] = useState<string[]>(
    empresaFixa ? [empresaFixa.id] : [],
  )
  const [documentoAberto, definirDocumentoAberto] = useState<DocumentoItem | null>(null)
  const [arrastando, definirArrastando] = useState(false)
  const [enviando, iniciarEnvio] = useTransition()
  const [lote, iniciarLote] = useTransition()
  const buscaRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)
  const sincronizarUrl = useRef(false)
  const adm = modo === 'adm'

  useAtalhoBusca(buscaRef)

  const abrirDocumento = useCallback(
    (doc: DocumentoItem) => {
      definirDocumentoAberto(doc)
      const params = new URLSearchParams(searchParams.toString())
      params.set('doc', doc.id)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const fecharDocumento = useCallback(() => {
    definirDocumentoAberto(null)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('doc')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  useEffect(() => {
    if (!sincronizarUrl.current) {
      sincronizarUrl.current = true
      return
    }
    const params = new URLSearchParams()
    const doc = searchParams.get('doc')
    if (doc) params.set('doc', doc)
    if (busca.trim()) params.set('q', busca.trim())
    if (filtroValidade !== 'todos') params.set('validade', filtroValidade)
    if (ordenacao !== 'recente') params.set('ordem', ordenacao)
    if (categoriaId) params.set('categoria', categoriaId)
    if (empresaId && adm) params.set('empresa', empresaId)
    const qs = params.toString()
    if (qs !== searchParams.toString()) {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }
  }, [busca, filtroValidade, ordenacao, categoriaId, empresaId, adm, pathname, router, searchParams])

  useEffect(() => {
    const docId = searchParams.get('doc')
    if (!docId) {
      definirDocumentoAberto(null)
      return
    }
    const doc = documentos.find((d) => d.id === docId)
    if (doc) definirDocumentoAberto(doc)
  }, [searchParams, documentos])

  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape' && documentoAberto) {
        e.preventDefault()
        fecharDocumento()
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [documentoAberto, fecharDocumento])

  useEffect(() => {
    if (empresaFixa) {
      definirEmpresasUpload([empresaFixa.id])
      definirEmpresaId(empresaFixa.id)
    }
  }, [empresaFixa])

  const filtrados = useMemo(() => {
    const lista = documentos.filter((d) => {
      if (busca) {
        const termo = busca.toLowerCase()
        const noTitulo = d.titulo.toLowerCase().includes(termo)
        const noArquivo = d.nome_arquivo.toLowerCase().includes(termo)
        if (!noTitulo && !noArquivo) return false
      }
      if (categoriaId && d.categoria_id !== categoriaId) return false
      if (empresaId && adm) {
        const vinculos = d.documento_empresas ?? []
        if (!vinculos.some((v) => v.empresa_id === empresaId)) return false
      }
      if (filtroValidade !== 'todos') {
        const st = statusValidade(d.valido_ate)
        if (filtroValidade === 'vencendo' && st !== 'vencendo') return false
        if (filtroValidade === 'vencido' && st !== 'vencido') return false
      }
      return true
    })

    return [...lista].sort((a, b) => {
      if (ordenacao === 'validade') {
        if (!a.valido_ate && !b.valido_ate) return 0
        if (!a.valido_ate) return 1
        if (!b.valido_ate) return -1
        return a.valido_ate.localeCompare(b.valido_ate)
      }
      const cmp = b.criado_em.localeCompare(a.criado_em)
      return ordenacao === 'antigo' ? -cmp : cmp
    })
  }, [documentos, busca, empresaId, categoriaId, adm, filtroValidade, ordenacao])

  function prorrogarFiltrados(dias: number) {
    if (filtrados.length === 0) {
      toast.error('Nenhum documento na lista.')
      return
    }
    iniciarLote(async () => {
      const r = await prorrogarValidadeEmLote(
        filtrados.map((d) => d.id),
        dias,
      )
      if (r.erro) {
        toast.error(r.erro)
        return
      }
      toast.success(`${r.atualizados} documento(s) prorrogado(s).`)
      router.refresh()
    })
  }

  const enviarArquivo = useCallback(
    (arquivo: File) => {
      if (!arquivo) return

      if (adm && empresasUpload.length === 0) {
        toast.error('Selecione ao menos uma empresa para o upload.')
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
              empresaIds: adm ? empresasUpload : undefined,
              categoriaId: categoriaId || undefined,
              validoAte: validoAteUpload || undefined,
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
    [empresasUpload, categoriaId, adm, router, validoAteUpload],
  )

  function exportarCsv() {
    if (filtrados.length === 0) {
      toast.error('Nada para exportar.')
      return
    }
    const linhas = [
      ['Título', 'Arquivo', 'Validade', 'Status', 'Tamanho', 'Criado em'].join(';'),
      ...filtrados.map((d) => {
        const st = statusValidade(d.valido_ate)
        return [
          `"${d.titulo.replace(/"/g, '""')}"`,
          `"${d.nome_arquivo.replace(/"/g, '""')}"`,
          d.valido_ate ?? '',
          rotuloStatusValidade(st),
          d.tamanho_arquivo ?? '',
          d.criado_em.slice(0, 10),
        ].join(';')
      }),
    ]
    const blob = new Blob([`\uFEFF${linhas.join('\n')}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `documentos-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Lista exportada.')
  }

  function nomesEmpresas(doc: DocumentoItem) {
    const nomes = (doc.documento_empresas ?? [])
      .map((v) => v.empresas?.nome_fantasia)
      .filter(Boolean) as string[]
    if (nomes.length === 0) return '—'
    if (nomes.length === 1) return nomes[0]
    return `${nomes[0]} +${nomes.length - 1}`
  }

  if (documentoAberto) {
    return (
      <SecaoPainel>
        <DialogoDetalheDocumento
          documento={documentoAberto}
          aberto
          onFechar={fecharDocumento}
          empresas={empresas}
          modo={modo}
          perfilId={perfilId}
        />
      </SecaoPainel>
    )
  }

  return (
    <SecaoPainel className="docs-pagina">
      <CabecalhoPagina
        rotulo={adm ? 'Administração' : 'Portal'}
        titulo={tituloPagina ?? 'Documentos'}
        descricao={
          descricaoPagina ??
          (adm ? 'Arquivos compartilhados com as empresas.' : 'Arquivos da sua empresa.')
        }
        acoes={
          <div className="docs-cabecalho-acoes">
            {adm && filtrados.length > 0 && (
              <Botao
                variante="fantasma"
                tamanho="sm"
                carregando={lote}
                onClick={() => prorrogarFiltrados(90)}
                filho={`Prorrogar +90d`}
              />
            )}
            <Botao variante="fantasma" tamanho="sm" onClick={exportarCsv} filho="Exportar" />
            <Botao
              variante="primario"
              tamanho="sm"
              carregando={enviando}
              onClick={() => uploadRef.current?.click()}
              filho="Enviar"
            />
          </div>
        }
      />

      <input
        ref={uploadRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) enviarArquivo(f)
          e.target.value = ''
        }}
      />

      {cota && cota.limite > 0 && modo === 'docs' && (
        <RevelarScroll atraso={0.02}>
          <div className="docs-cota">
            {(() => {
              const pct = Math.min((cota.usado / cota.limite) * 100, 100)
              return (
                <>
                  <div className="docs-cota-texto">
                    <span>Armazenamento</span>
                    <strong>
                      {formatarBytes(cota.usado)} / {formatarBytes(cota.limite)}
                    </strong>
                  </div>
                  <div className="docs-cota-barra">
                    <div
                      className={cn('docs-cota-fill', pct >= 90 && 'docs-cota-fill--alerta')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </>
              )
            })()}
          </div>
        </RevelarScroll>
      )}

      <RevelarScroll atraso={0.03}>
        <section className="docs-bloco docs-bloco--envio">
          <div className="docs-bloco-cabeca">
            <h2 className="docs-bloco-titulo">Envio</h2>
            <p className="docs-bloco-desc">
              {adm
                ? 'Escolha o destino e a validade, depois arraste o arquivo.'
                : 'Defina a validade (opcional) e envie o arquivo.'}
            </p>
          </div>

          <div className="docs-envio-grid">
            {adm && (
              <SeletorEmpresasUpload
                empresas={empresas}
                selecionadas={empresasUpload}
                onChange={definirEmpresasUpload}
                fixas={empresaFixa ? [empresaFixa.id] : []}
                className="docs-seletor-empresas"
              />
            )}
            <div className="docs-envio-lado">
              <Campo
                rotulo="Validade (opcional)"
                type="date"
                value={validoAteUpload}
                onChange={(e) => definirValidoAteUpload(e.target.value)}
              />
              <div
                className={cn('docs-dropzone', arrastando && 'docs-dropzone--ativo', enviando && 'docs-dropzone--busy')}
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
                onClick={() => !enviando && uploadRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    uploadRef.current?.click()
                  }
                }}
              >
                <strong>{enviando ? 'Enviando…' : 'Solte o arquivo aqui'}</strong>
                <span>PDF, DOCX ou planilha · até 50 MB</span>
              </div>
            </div>
          </div>
        </section>
      </RevelarScroll>

      <RevelarScroll atraso={0.05}>
        <section className="docs-bloco">
          <div className="docs-bloco-cabeca docs-bloco-cabeca--linha">
            <div>
              <h2 className="docs-bloco-titulo">Lista</h2>
              <p className="docs-bloco-desc">
                {filtrados.length} de {documentos.length} documento{documentos.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="docs-filtros">
            <input
              ref={buscaRef}
              className="docs-filtro docs-filtro--busca"
              placeholder="Buscar…"
              value={busca}
              onChange={(e) => definirBusca(e.target.value)}
              aria-label="Buscar documentos"
            />
            {adm && !empresaFixa && (
              <select
                className="docs-filtro"
                value={empresaId}
                onChange={(e) => definirEmpresaId(e.target.value)}
                aria-label="Empresa"
              >
                <option value="">Todas as empresas</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome_fantasia}
                  </option>
                ))}
              </select>
            )}
            {categorias.length > 0 && (
              <select
                className="docs-filtro"
                value={categoriaId}
                onChange={(e) => definirCategoriaId(e.target.value)}
                aria-label="Categoria"
              >
                <option value="">Todas as categorias</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            )}
            <select
              className="docs-filtro"
              value={filtroValidade}
              onChange={(e) => definirFiltroValidade(e.target.value as typeof filtroValidade)}
              aria-label="Validade"
            >
              <option value="todos">Toda validade</option>
              <option value="vencendo">Vence em 30 dias</option>
              <option value="vencido">Vencidos</option>
            </select>
            <select
              className="docs-filtro"
              value={ordenacao}
              onChange={(e) => definirOrdenacao(e.target.value as typeof ordenacao)}
              aria-label="Ordenar"
            >
              <option value="recente">Mais recentes</option>
              <option value="antigo">Mais antigos</option>
              <option value="validade">Validade próxima</option>
            </select>
          </div>

          <div className="docs-lista">
            {filtrados.length === 0 ? (
              <Vazio
                titulo="Nenhum documento"
                descricao="Ajuste os filtros ou envie um arquivo acima."
                compacto
              />
            ) : (
              <table className="docs-tabela">
                <thead>
                  <tr>
                    <th>Documento</th>
                    {adm && !empresaFixa && <th className="hidden md:table-cell">Empresa</th>}
                    <th className="hidden sm:table-cell">Categoria</th>
                    <th>Validade</th>
                    <th className="hidden sm:table-cell">Tamanho</th>
                    {adm && <th className="hidden lg:table-cell">Uso</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((doc) => {
                    const st = statusValidade(doc.valido_ate)
                    return (
                      <tr key={doc.id} onClick={() => abrirDocumento(doc)}>
                        <td>
                          <div className="docs-cell-titulo">
                            <span className="docs-cell-nome">{doc.titulo}</span>
                            <span className="docs-cell-meta">{formatarData(doc.criado_em)}</span>
                          </div>
                        </td>
                        {adm && !empresaFixa && (
                          <td className="hidden md:table-cell docs-cell-muted">{nomesEmpresas(doc)}</td>
                        )}
                        <td className="hidden sm:table-cell docs-cell-muted">
                          {doc.categorias?.nome ?? '—'}
                        </td>
                        <td>
                          {st === 'indefinido' ? (
                            <span className="docs-cell-muted">—</span>
                          ) : (
                            <span className={classeStatus(st)}>
                              {doc.valido_ate ? formatarData(doc.valido_ate) : rotuloStatusValidade(st)}
                            </span>
                          )}
                        </td>
                        <td className="hidden sm:table-cell docs-cell-muted">
                          {doc.tamanho_arquivo ? formatarBytes(doc.tamanho_arquivo) : '—'}
                        </td>
                        {adm && (
                          <td className="hidden lg:table-cell docs-cell-muted">
                            {(doc.total_visualizacoes ?? 0)} · {doc.total_downloads}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </RevelarScroll>
    </SecaoPainel>
  )
}
