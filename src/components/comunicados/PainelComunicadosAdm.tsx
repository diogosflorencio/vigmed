'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Eye, Pencil, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { ConfirmacaoExclusaoInline } from '@/components/ui/ConfirmacaoExclusaoInline'
import { Botao } from '@/components/vig/Botao'
import { Campo } from '@/components/vig/Campo'
import { Vazio } from '@/components/vig/Vazio'
import { EditorComunicado, textoPlanoHtml } from '@/components/comunicados/EditorComunicado'
import { useAcaoPendente } from '@/hooks/use-acao-pendente'
import {
  atualizarComunicado,
  excluirComunicado,
  listarVisualizacoesComunicado,
  publicarComunicado,
  type ComunicadoAdmin,
  type VisualizacaoEmpresa,
} from '@/lib/comunicados/acoes'
import { cn, formatarDataHora } from '@/lib/utils'
import type { PrioridadeComunicado } from '@/types'

type Aba = 'ativos' | 'rascunhos' | 'historico'

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'ativos', rotulo: 'Ativos' },
  { id: 'rascunhos', rotulo: 'Rascunhos' },
  { id: 'historico', rotulo: 'Histórico' },
]

interface Props {
  comunicadosIniciais: ComunicadoAdmin[]
  empresas: { id: string; nome_fantasia: string }[]
}

function formularioVazio() {
  return {
    titulo: '',
    corpo: '',
    prioridade: 'normal' as PrioridadeComunicado,
    paraTodos: true,
    empresaIds: [] as string[],
  }
}

function rotuloPrioridade(p: string) {
  if (p === 'urgente') return 'Urgente'
  if (p === 'alta') return 'Alta'
  if (p === 'baixa') return 'Baixa'
  return 'Normal'
}

export function PainelComunicadosAdm({ comunicadosIniciais, empresas }: Props) {
  const router = useRouter()
  const [aba, definirAba] = useState<Aba>('ativos')
  const [busca, definirBusca] = useState('')
  const { pendente, executar } = useAcaoPendente<'salvar' | 'excluir'>()

  const [editandoId, definirEditandoId] = useState<string | null>(null)
  const [form, definirForm] = useState(formularioVazio)
  const [excluirId, definirExcluirId] = useState<string | null>(null)
  const [visualizacoesId, definirVisualizacoesId] = useState<string | null>(null)
  const [visualizacoes, definirVisualizacoes] = useState<VisualizacaoEmpresa[]>([])
  const [carregandoViz, definirCarregandoViz] = useState(false)

  const comunicados = useMemo(() => {
    return comunicadosIniciais.filter((c) => {
      const rascunho = (c.metadados as { rascunho?: boolean })?.rascunho
      if (aba === 'ativos' && !c.ativo) return false
      if (aba === 'rascunhos' && (!rascunho || c.ativo)) return false
      if (aba === 'historico' && (rascunho || c.ativo)) return false
      if (busca && !c.titulo.toLowerCase().includes(busca.toLowerCase())) return false
      return true
    })
  }, [comunicadosIniciais, aba, busca])

  useEffect(() => {
    if (!visualizacoesId) {
      definirVisualizacoes([])
      return
    }
    let cancelado = false
    definirCarregandoViz(true)
    void listarVisualizacoesComunicado(visualizacoesId).then((res) => {
      if (cancelado) return
      definirVisualizacoes(res.empresas)
      definirCarregandoViz(false)
    })
    return () => {
      cancelado = true
    }
  }, [visualizacoesId])

  function limparFormulario() {
    definirEditandoId(null)
    definirForm(formularioVazio())
  }

  function carregarEdicao(c: ComunicadoAdmin) {
    definirEditandoId(c.id)
    definirForm({
      titulo: c.titulo,
      corpo: c.corpo,
      prioridade: c.prioridade,
      paraTodos: c.para_todos,
      empresaIds: c.empresa_ids ?? [],
    })
    definirVisualizacoesId(null)
  }

  function enviar(rascunho: boolean) {
    if (!form.titulo.trim() || !textoPlanoHtml(form.corpo)) {
      toast.error('Preencha título e mensagem.')
      return
    }
    void executar('salvar', async () => {
      const payload = {
        titulo: form.titulo,
        corpo: form.corpo,
        prioridade: form.prioridade,
        paraTodos: form.paraTodos,
        empresaIds: form.paraTodos ? undefined : form.empresaIds,
        rascunho,
      }
      const resultado = editandoId
        ? await atualizarComunicado({ id: editandoId, ...payload })
        : await publicarComunicado(payload)

      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      const publicado = !rascunho
      let msg = editandoId ? 'Comunicado atualizado.' : rascunho ? 'Rascunho salvo.' : 'Comunicado publicado.'
      if (publicado && 'emailEnviado' in resultado && resultado.emailEnviado) {
        msg += ' E-mails enviados às empresas.'
      } else if (publicado && 'emailEnviado' in resultado && resultado.emailEnviado === false) {
        msg += ' (e-mail automático não configurado ou sem destinatários)'
      }
      toast.success(msg)
      limparFormulario()
      router.refresh()
    })
  }

  function confirmarExclusao(id: string) {
    void executar('excluir', async () => {
      const resultado = await excluirComunicado(id)
      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      toast.success('Comunicado excluído.')
      if (editandoId === id) limparFormulario()
      if (visualizacoesId === id) definirVisualizacoesId(null)
      definirExcluirId(null)
      router.refresh()
    })
  }

  const vistos = visualizacoes.filter((v) => v.visualizou).length

  return (
    <SecaoPainel className="com-pagina">
      <CabecalhoPagina
        rotulo="Administração"
        titulo="Comunicados"
        descricao="Avisos para as empresas."
      />

      <div className="com-layout">
        <RevelarScroll>
          <section className="com-bloco">
            <div className="com-bloco-cabeca com-bloco-cabeca--linha">
              <div>
                <h2 className="com-bloco-titulo">Lista</h2>
                <p className="com-bloco-desc">
                  {comunicados.length} comunicado{comunicados.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            <div className="com-filtros">
              <input
                className="com-filtro com-filtro--busca"
                placeholder="Buscar…"
                value={busca}
                onChange={(e) => definirBusca(e.target.value)}
                aria-label="Buscar comunicados"
              />
              <select
                className="com-filtro"
                value={aba}
                onChange={(e) => definirAba(e.target.value as Aba)}
                aria-label="Aba"
              >
                {ABAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.rotulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="com-lista">
              {comunicados.length === 0 ? (
                <Vazio titulo="Nenhum comunicado nesta aba" compacto />
              ) : (
                comunicados.map((c) => (
                  <article
                    key={c.id}
                    className={cn(
                      'com-item',
                      c.fixado && 'com-item--fixado',
                      editandoId === c.id && 'com-item--ativo',
                    )}
                  >
                    <div className="com-item-topo">
                      <div className="com-item-titulos">
                        <h3 className="com-item-titulo">{c.titulo}</h3>
                        <p className="com-item-meta">
                          {formatarDataHora(c.publicado_em)}
                          {c.fixado ? ' · Fixado' : ''}
                          {' · '}
                          {c.para_todos ? 'Todas as empresas' : `${c.empresa_ids?.length ?? 0} empresas`}
                        </p>
                      </div>
                      <span className={cn('com-prio', `com-prio--${c.prioridade}`)}>
                        {rotuloPrioridade(c.prioridade)}
                      </span>
                    </div>

                    <p className="com-item-resumo">{textoPlanoHtml(c.corpo)}</p>

                    <div className="com-item-acoes">
                      <button
                        type="button"
                        className={cn('com-acao', visualizacoesId === c.id && 'com-acao--ativa')}
                        onClick={() => definirVisualizacoesId(visualizacoesId === c.id ? null : c.id)}
                      >
                        <Eye size={14} />
                        Leituras
                      </button>
                      <button type="button" className="com-acao" onClick={() => carregarEdicao(c)}>
                        <Pencil size={14} />
                        Editar
                      </button>
                      <ConfirmacaoExclusaoInline
                        ariaLabel="Excluir comunicado"
                        rotulo="Excluir"
                        confirmando={excluirId === c.id}
                        desabilitado={pendente('excluir')}
                        onPedir={() => definirExcluirId(c.id)}
                        onConfirmar={() => confirmarExclusao(c.id)}
                        onCancelar={() => definirExcluirId(null)}
                      />
                    </div>

                    {visualizacoesId === c.id && (
                      <div className="com-leituras">
                        <div className="com-leituras-topo">
                          <span>Quem leu</span>
                          {!carregandoViz && (
                            <span>
                              {vistos}/{visualizacoes.length}
                            </span>
                          )}
                        </div>
                        {carregandoViz ? (
                          <p className="com-leituras-vazio">Carregando…</p>
                        ) : visualizacoes.length === 0 ? (
                          <p className="com-leituras-vazio">Nenhuma empresa destinatária.</p>
                        ) : (
                          <ul className="com-leituras-lista">
                            {visualizacoes.map((v) => (
                              <li key={v.empresa_id}>
                                <span>{v.nome}</span>
                                {v.visualizou ? (
                                  <span className="com-leituras-ok">
                                    <Check size={12} />
                                    {v.lido_em ? formatarDataHora(v.lido_em) : 'Leu'}
                                  </span>
                                ) : (
                                  <span className="com-leituras-nao">Não leu</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>
        </RevelarScroll>

        <RevelarScroll atraso={0.05}>
          <section className="com-bloco com-bloco--form">
            <div className="com-bloco-cabeca com-bloco-cabeca--linha">
              <div>
                <h2 className="com-bloco-titulo">
                  {editandoId ? 'Editar' : 'Novo comunicado'}
                </h2>
                <p className="com-bloco-desc">
                  {editandoId ? 'Altere e salve ou publique de novo.' : 'Preencha e publique para as empresas.'}
                </p>
              </div>
              {editandoId && (
                <button type="button" className="com-acao" onClick={limparFormulario} aria-label="Cancelar edição">
                  <X size={14} />
                  Cancelar
                </button>
              )}
            </div>

            <div className="com-form">
              <Campo
                rotulo="Título"
                placeholder="Ex.: Atualização do sistema"
                value={form.titulo}
                onChange={(e) => definirForm((f) => ({ ...f, titulo: e.target.value }))}
              />

              <div className="com-form-linha">
                <label className="com-campo">
                  <span>Prioridade</span>
                  <select
                    className="com-filtro"
                    value={form.prioridade}
                    onChange={(e) =>
                      definirForm((f) => ({ ...f, prioridade: e.target.value as PrioridadeComunicado }))
                    }
                  >
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </label>
                <label className="com-campo">
                  <span>Destinatários</span>
                  <select
                    className="com-filtro"
                    value={form.paraTodos ? 'all' : 'sel'}
                    onChange={(e) => definirForm((f) => ({ ...f, paraTodos: e.target.value === 'all' }))}
                  >
                    <option value="all">Todas as empresas</option>
                    <option value="sel">Selecionar…</option>
                  </select>
                </label>
              </div>

              {!form.paraTodos && (
                <div className="com-empresas">
                  {empresas.map((e) => (
                    <label key={e.id} className="com-empresa">
                      <input
                        type="checkbox"
                        checked={form.empresaIds.includes(e.id)}
                        onChange={(ev) => {
                          definirForm((f) => ({
                            ...f,
                            empresaIds: ev.target.checked
                              ? [...f.empresaIds, e.id]
                              : f.empresaIds.filter((id) => id !== e.id),
                          }))
                        }}
                      />
                      <span>{e.nome_fantasia}</span>
                    </label>
                  ))}
                </div>
              )}

              <div className="com-campo">
                <span>Mensagem</span>
                <EditorComunicado
                  key={editandoId ?? 'novo'}
                  conteudo={form.corpo}
                  onChange={(html) => definirForm((f) => ({ ...f, corpo: html }))}
                  className="com-editor"
                />
              </div>

              <div className="com-form-acoes">
                <Botao
                  variante="fantasma"
                  tamanho="sm"
                  carregando={pendente('salvar')}
                  onClick={() => enviar(true)}
                  filho={editandoId ? 'Salvar rascunho' : 'Rascunho'}
                />
                <Botao
                  variante="primario"
                  tamanho="sm"
                  carregando={pendente('salvar')}
                  onClick={() => enviar(false)}
                  filho={editandoId ? 'Salvar' : 'Publicar'}
                />
              </div>
            </div>
          </section>
        </RevelarScroll>
      </div>
    </SecaoPainel>
  )
}
