'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAtalhoBusca } from '@/hooks/use-atalho-busca'
import { CaretLeft, Check, Checks, PaperPlaneTilt, Plus, X } from '@phosphor-icons/react'
import toast from 'react-hot-toast'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { Botao } from '@/components/vig/Botao'
import { EsqueletoChat } from '@/components/vig/Esqueleto'
import { Vazio } from '@/components/vig/Vazio'
import { ConfirmacaoExclusaoInline } from '@/components/ui/ConfirmacaoExclusaoInline'
import { useMensagensNaoLidas } from '@/contexts/MensagensNaoLidasContext'
import { useAcaoPendente } from '@/hooks/use-acao-pendente'
import {
  criarConversa,
  enviarMensagem,
  excluirConversa,
  excluirMensagem,
  listarMensagens,
} from '@/lib/mensagens/acoes'
import { cn, formatarDataHora } from '@/lib/utils'

interface ConversaItem {
  id: string
  assunto: string | null
  atualizado_em: string
  empresa_id?: string | null
  empresas?: { nome_fantasia: string } | null
  nao_lidas?: number
  mensagens?: { corpo: string; criado_em: string }[]
}

interface MensagemItem {
  id: string
  corpo: string
  criado_em: string
  remetente_id: string
  lida?: boolean
  lida_em?: string | null
  perfis?: { nome_completo: string } | null
}

interface Props {
  conversasIniciais: ConversaItem[]
  empresas: { id: string; nome_fantasia: string }[]
  perfilId: string
  modoAdmin: boolean
}

export function PainelMensagens({ conversasIniciais, empresas, perfilId, modoAdmin }: Props) {
  const searchParams = useSearchParams()
  const { pendente, executar } = useAcaoPendente<'criar' | 'enviar' | 'excluir-conversa' | 'excluir-mensagem'>()
  const { total: totalNaoLidas, definirTotal, atualizar: atualizarNaoLidas } = useMensagensNaoLidas()
  const [conversas, definirConversas] = useState(conversasIniciais)
  const [selecionada, definirSelecionada] = useState<string | null>(conversasIniciais[0]?.id ?? null)
  const [mensagens, definirMensagens] = useState<MensagemItem[]>([])
  const [texto, definirTexto] = useState('')
  const [novaAssunto, definirNovaAssunto] = useState('')
  const [novaEmpresa, definirNovaEmpresa] = useState('')
  const [carregandoMsgs, definirCarregandoMsgs] = useState(false)
  const [excluirConversaId, definirExcluirConversaId] = useState<string | null>(null)
  const [excluirMensagemId, definirExcluirMensagemId] = useState<string | null>(null)
  const [mobileThread, definirMobileThread] = useState(false)
  const [buscaConversa, definirBuscaConversa] = useState('')
  const [somenteNaoLidas, definirSomenteNaoLidas] = useState(false)
  const [empresaFiltro, definirEmpresaFiltro] = useState('')
  const [novaAberta, definirNovaAberta] = useState(false)
  const fimRef = useRef<HTMLDivElement>(null)
  const textoRef = useRef<HTMLTextAreaElement>(null)
  const buscaRef = useRef<HTMLInputElement>(null)

  useAtalhoBusca(buscaRef)

  useEffect(() => {
    const porId = new Map<string, ConversaItem>()
    for (const c of conversasIniciais) porId.set(c.id, c)
    definirConversas((atuais) => {
      for (const c of atuais) {
        if (!porId.has(c.id)) porId.set(c.id, c)
      }
      return [...porId.values()].sort((a, b) => b.atualizado_em.localeCompare(a.atualizado_em))
    })
  }, [conversasIniciais])

  useEffect(() => {
    const conversaParam = searchParams.get('conversa')
    if (!conversaParam) return
    if (conversasIniciais.some((c) => c.id === conversaParam)) {
      definirSelecionada(conversaParam)
      definirMobileThread(true)
    }
  }, [searchParams, conversasIniciais])

  useEffect(() => {
    if (!selecionada) return
    let ativo = true
    definirCarregandoMsgs(true)
    void listarMensagens(selecionada)
      .then((lista) => {
        if (ativo) definirMensagens(lista as MensagemItem[])
      })
      .catch(() => toast.error('Não foi possível carregar as mensagens.'))
      .finally(() => {
        if (ativo) definirCarregandoMsgs(false)
      })
    return () => {
      ativo = false
    }
  }, [selecionada])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [mensagens.length, selecionada])

  useEffect(() => {
    const el = textoRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [texto])

  async function selecionarConversa(conversaId: string) {
    const anteriores = conversas.find((c) => c.id === conversaId)?.nao_lidas ?? 0
    definirSelecionada(conversaId)
    definirExcluirMensagemId(null)
    definirExcluirConversaId(null)
    definirMobileThread(true)

    if (anteriores > 0) {
      definirConversas((lista) =>
        lista.map((c) => (c.id === conversaId ? { ...c, nao_lidas: 0 } : c)),
      )
      definirTotal(Math.max(0, totalNaoLidas - anteriores))
    }

    await atualizarNaoLidas()
  }

  function aoEnviar() {
    if (!selecionada || !texto.trim()) return
    const corpo = texto.trim()
    const conversaId = selecionada
    definirTexto('')
    void executar('enviar', async () => {
      const r = await enviarMensagem(conversaId, corpo)
      if (r.erro) {
        toast.error(r.erro)
        definirTexto(corpo)
        return
      }
      const lista = await listarMensagens(conversaId)
      definirMensagens(lista as MensagemItem[])
      definirConversas((atuais) =>
        [...atuais]
          .map((c) =>
            c.id === conversaId
              ? { ...c, atualizado_em: new Date().toISOString(), nao_lidas: 0 }
              : c,
          )
          .sort((a, b) => b.atualizado_em.localeCompare(a.atualizado_em)),
      )
    })
  }

  function criarNova() {
    if (!novaAssunto.trim() || !novaEmpresa) {
      toast.error('Informe assunto e empresa.')
      return
    }
    void executar('criar', async () => {
      const r = await criarConversa(novaAssunto.trim(), novaEmpresa)
      if (r.erro) {
        toast.error(r.erro)
        return
      }
      toast.success('Conversa criada.')
      definirNovaAssunto('')
      definirNovaEmpresa('')
      definirNovaAberta(false)
      if (r.conversa) {
        definirConversas((lista) =>
          [r.conversa!, ...lista.filter((c) => c.id !== r.conversa!.id)].sort((a, b) =>
            b.atualizado_em.localeCompare(a.atualizado_em),
          ),
        )
        definirSelecionada(r.conversaId ?? r.conversa.id)
        definirMobileThread(true)
      }
    })
  }

  function confirmarExcluirConversa(id: string) {
    void executar('excluir-conversa', async () => {
      const r = await excluirConversa(id)
      if (r.erro) {
        toast.error(r.erro)
        return
      }
      toast.success('Conversa excluída.')
      definirExcluirConversaId(null)
      definirConversas((lista) => lista.filter((c) => c.id !== id))
      if (selecionada === id) {
        definirSelecionada(null)
        definirMensagens([])
        definirMobileThread(false)
      }
    })
  }

  function confirmarExcluirMensagem(id: string) {
    void executar('excluir-mensagem', async () => {
      const r = await excluirMensagem(id)
      if (r.erro) {
        toast.error(r.erro)
        return
      }
      toast.success('Mensagem excluída.')
      definirExcluirMensagemId(null)
      definirMensagens((lista) => lista.filter((m) => m.id !== id))
    })
  }

  const conversaAtual = conversas.find((c) => c.id === selecionada)

  const conversasFiltradas = conversas.filter((c) => {
    if (somenteNaoLidas && (c.nao_lidas ?? 0) === 0) return false
    if (empresaFiltro && c.empresa_id !== empresaFiltro) return false
    if (!buscaConversa.trim()) return true
    const termo = buscaConversa.trim().toLowerCase()
    const assunto = (c.assunto ?? '').toLowerCase()
    const empresa = (c.empresas?.nome_fantasia ?? '').toLowerCase()
    return assunto.includes(termo) || empresa.includes(termo)
  })

  return (
    <SecaoPainel className="msg-pagina">
      <CabecalhoPagina
        rotulo={modoAdmin ? 'Administração' : 'Portal'}
        titulo="Mensagens"
        descricao={modoAdmin ? 'Conversas com as empresas.' : 'Fale com a equipe VIGMED.'}
      />

      <RevelarScroll atraso={0.04}>
        <div
          className={cn(
            'msg-shell',
            !modoAdmin && 'msg-shell--empresa',
            mobileThread && 'msg-shell--thread',
          )}
        >
          <aside className="msg-lista">
            <div className="msg-lista-topo">
              <div>
                <h2 className="msg-lista-titulo">Conversas</h2>
                <p className="msg-lista-contagem">{conversasFiltradas.length}</p>
              </div>
              {modoAdmin && (
                <button
                  type="button"
                  className={cn('msg-btn-nova', novaAberta && 'msg-btn-nova--aberta')}
                  onClick={() => definirNovaAberta((v) => !v)}
                  aria-expanded={novaAberta}
                >
                  {novaAberta ? <X size={14} weight="bold" /> : <Plus size={14} weight="bold" />}
                  {novaAberta ? 'Fechar' : 'Nova'}
                </button>
              )}
            </div>

            {modoAdmin && novaAberta && (
              <div className="msg-nova">
                <label className="msg-campo">
                  <span>Assunto</span>
                  <input
                    className="msg-input"
                    placeholder="Ex.: Renovação PCMSO"
                    value={novaAssunto}
                    onChange={(e) => definirNovaAssunto(e.target.value)}
                  />
                </label>
                <label className="msg-campo">
                  <span>Empresa</span>
                  <select
                    className="msg-input msg-select"
                    value={novaEmpresa}
                    onChange={(e) => definirNovaEmpresa(e.target.value)}
                  >
                    <option value="">Selecione…</option>
                    {empresas.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nome_fantasia}
                      </option>
                    ))}
                  </select>
                </label>
                <Botao
                  variante="primario"
                  tamanho="sm"
                  carregando={pendente('criar')}
                  onClick={criarNova}
                  filho="Criar conversa"
                />
              </div>
            )}

            <div className="msg-filtros">
              <input
                ref={buscaRef}
                className="msg-input"
                placeholder="Buscar…"
                value={buscaConversa}
                onChange={(e) => definirBuscaConversa(e.target.value)}
                aria-label="Buscar conversas"
              />
              {modoAdmin && empresas.length > 1 && (
                <select
                  className="msg-input msg-select"
                  value={empresaFiltro}
                  onChange={(e) => definirEmpresaFiltro(e.target.value)}
                  aria-label="Filtrar por empresa"
                >
                  <option value="">Todas as empresas</option>
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nome_fantasia}
                    </option>
                  ))}
                </select>
              )}
              <select
                className="msg-input msg-select"
                value={somenteNaoLidas ? 'nao-lidas' : 'todas'}
                onChange={(e) => definirSomenteNaoLidas(e.target.value === 'nao-lidas')}
                aria-label="Filtro de leitura"
              >
                <option value="todas">Todas</option>
                <option value="nao-lidas">
                  Não lidas{totalNaoLidas > 0 ? ` (${totalNaoLidas})` : ''}
                </option>
              </select>
            </div>

            <div className="msg-lista-corpo">
              {conversasFiltradas.map((c) => {
                const naoLidas = c.nao_lidas ?? 0
                const ativa = selecionada === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => void selecionarConversa(c.id)}
                    className={cn(
                      'msg-item',
                      ativa && 'msg-item--ativo',
                      naoLidas > 0 && 'msg-item--novo',
                    )}
                  >
                    <span className="msg-item-assunto">{c.assunto ?? 'Sem assunto'}</span>
                    <span className="msg-item-meta">
                      {modoAdmin && c.empresas?.nome_fantasia
                        ? `${c.empresas.nome_fantasia} · `
                        : ''}
                      {formatarDataHora(c.atualizado_em)}
                    </span>
                    {naoLidas > 0 && (
                      <span className="msg-item-badge">{naoLidas > 99 ? '99+' : naoLidas}</span>
                    )}
                  </button>
                )
              })}
              {conversasFiltradas.length === 0 && (
                <Vazio
                  titulo={buscaConversa.trim() ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa'}
                  descricao={
                    buscaConversa.trim()
                      ? 'Tente outro termo.'
                      : modoAdmin
                        ? 'Crie uma conversa com Nova.'
                        : 'A equipe VIGMED inicia o contato quando necessário.'
                  }
                  compacto
                />
              )}
            </div>
          </aside>

          <section className="msg-thread">
            {conversaAtual ? (
              <>
                <header className="msg-thread-topo">
                  <button
                    type="button"
                    className="msg-voltar md:hidden"
                    onClick={() => definirMobileThread(false)}
                    aria-label="Voltar para conversas"
                  >
                    <CaretLeft size={18} weight="bold" />
                  </button>
                  <div className="msg-thread-info">
                    <h3>{conversaAtual.assunto}</h3>
                    {modoAdmin && conversaAtual.empresas?.nome_fantasia && (
                      <p>{conversaAtual.empresas.nome_fantasia}</p>
                    )}
                  </div>
                  {modoAdmin && (
                    <ConfirmacaoExclusaoInline
                      ariaLabel="Excluir conversa"
                      compacta
                      rotuloConfirmar="Excluir conversa?"
                      confirmando={excluirConversaId === conversaAtual.id}
                      desabilitado={pendente('excluir-conversa')}
                      onPedir={() => {
                        definirExcluirMensagemId(null)
                        definirExcluirConversaId(conversaAtual.id)
                      }}
                      onConfirmar={() => confirmarExcluirConversa(conversaAtual.id)}
                      onCancelar={() => definirExcluirConversaId(null)}
                    />
                  )}
                </header>

                <div className="msg-thread-msgs">
                  {carregandoMsgs && <EsqueletoChat />}
                  {!carregandoMsgs && mensagens.length === 0 && (
                    <Vazio
                      titulo="Nenhuma mensagem ainda"
                      descricao="Escreva abaixo para iniciar."
                      compacto
                    />
                  )}
                  {mensagens.map((m) => {
                    const propria = m.remetente_id === perfilId
                    return (
                      <div
                        key={m.id}
                        className={cn('msg-bolha-wrap', propria && 'msg-bolha-wrap--minha')}
                      >
                        {!propria && (
                          <span className="msg-autor">{m.perfis?.nome_completo ?? 'VIGMED'}</span>
                        )}
                        <div className={cn('msg-bolha', propria ? 'msg-bolha--minha' : 'msg-bolha--deles')}>
                          <p>{m.corpo}</p>
                          <span className="msg-bolha-meta">
                            {formatarDataHora(m.criado_em)}
                            {propria && (
                              <span title={m.lida ? 'Visualizada' : 'Enviada'}>
                                {m.lida ? (
                                  <Checks size={13} weight="bold" />
                                ) : (
                                  <Check size={13} weight="bold" />
                                )}
                              </span>
                            )}
                          </span>
                        </div>
                        {modoAdmin && (
                          <div className="msg-bolha-acoes">
                            <ConfirmacaoExclusaoInline
                              ariaLabel="Excluir mensagem"
                              compacta
                              confirmando={excluirMensagemId === m.id}
                              desabilitado={pendente('excluir-mensagem')}
                              onPedir={() => {
                                definirExcluirConversaId(null)
                                definirExcluirMensagemId(m.id)
                              }}
                              onConfirmar={() => confirmarExcluirMensagem(m.id)}
                              onCancelar={() => definirExcluirMensagemId(null)}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <div ref={fimRef} />
                </div>

                <footer className="msg-composer">
                  <textarea
                    ref={textoRef}
                    id="mensagem-texto"
                    className="msg-composer-input"
                    placeholder="Escreva uma mensagem…"
                    rows={1}
                    value={texto}
                    onChange={(e) => definirTexto(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        aoEnviar()
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="msg-composer-enviar"
                    onClick={aoEnviar}
                    disabled={!texto.trim() || pendente('enviar')}
                    aria-label="Enviar mensagem"
                  >
                    <PaperPlaneTilt size={18} weight="fill" />
                  </button>
                </footer>
              </>
            ) : (
              <div className="msg-vazio-thread">
                <Vazio
                  titulo={
                    conversas.length === 0
                      ? modoAdmin
                        ? 'Crie uma conversa'
                        : 'Sem conversas'
                      : 'Selecione uma conversa'
                  }
                  descricao={
                    conversas.length === 0
                      ? undefined
                      : 'Escolha um item na lista ao lado.'
                  }
                  compacto
                />
              </div>
            )}
          </section>
        </div>
      </RevelarScroll>
    </SecaoPainel>
  )
}
