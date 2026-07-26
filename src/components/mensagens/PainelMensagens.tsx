'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Plus, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { Avatar, Button } from '@/components/ui'
import { criarConversa, enviarMensagem, listarMensagens } from '@/lib/mensagens/acoes'
import { cn, formatarDataHora } from '@/lib/utils'

interface ConversaItem {
  id: string
  assunto: string | null
  atualizado_em: string
  empresas?: { nome_fantasia: string } | null
  mensagens?: { corpo: string; criado_em: string }[]
}

interface MensagemItem {
  id: string
  corpo: string
  criado_em: string
  remetente_id: string
  perfis?: { nome_completo: string } | null
}

interface Props {
  conversasIniciais: ConversaItem[]
  empresas: { id: string; nome_fantasia: string }[]
  perfilId: string
  modoAdmin: boolean
}

export function PainelMensagens({ conversasIniciais, empresas, perfilId, modoAdmin }: Props) {
  const router = useRouter()
  const [conversas] = useState(conversasIniciais)
  const [selecionada, definirSelecionada] = useState<string | null>(conversasIniciais[0]?.id ?? null)
  const [mensagens, definirMensagens] = useState<MensagemItem[]>([])
  const [texto, definirTexto] = useState('')
  const [novaAssunto, definirNovaAssunto] = useState('')
  const [novaEmpresa, definirNovaEmpresa] = useState('')
  const [pendente, iniciarTransicao] = useTransition()

  async function carregarMensagens(conversaId: string) {
    definirSelecionada(conversaId)
    const lista = await listarMensagens(conversaId)
    definirMensagens(lista as MensagemItem[])
  }

  function aoEnviar() {
    if (!selecionada || !texto.trim()) return
    iniciarTransicao(async () => {
      const resultado = await enviarMensagem(selecionada, texto)
      if (resultado.erro) { toast.error(resultado.erro); return }
      definirTexto('')
      await carregarMensagens(selecionada)
      router.refresh()
    })
  }

  function criarNova() {
    if (!novaAssunto.trim()) { toast.error('Informe o assunto.'); return }
    iniciarTransicao(async () => {
      const resultado = await criarConversa(novaAssunto, novaEmpresa || undefined)
      if (resultado.erro) { toast.error(resultado.erro); return }
      toast.success('Conversa criada.')
      definirNovaAssunto('')
      router.refresh()
    })
  }

  const conversaAtual = conversas.find((c) => c.id === selecionada)

  return (
    <SecaoPainel>
      <CabecalhoPagina
        titulo="Mensagens"
        descricao="Comunicação direta entre administradores e empresas."
      />

      {modoAdmin && (
        <RevelarScroll>
          <div className="painel-nova-conversa">
            <div className="painel-campo" style={{ flex: 1, minWidth: 160 }}>
              <label className="painel-label">Nova conversa</label>
              <input
                className="painel-input"
                placeholder="Assunto da conversa..."
                value={novaAssunto}
                onChange={(e) => definirNovaAssunto(e.target.value)}
              />
            </div>
            <div className="painel-campo" style={{ minWidth: 180 }}>
              <label className="painel-label">Empresa</label>
              <select className="painel-select" style={{ width: '100%' }} value={novaEmpresa} onChange={(e) => definirNovaEmpresa(e.target.value)}>
                <option value="">Selecione...</option>
                {empresas.map((e) => <option key={e.id} value={e.id}>{e.nome_fantasia}</option>)}
              </select>
            </div>
            <div style={{ paddingTop: '1.1rem' }}>
              <Button variant="primary" size="sm" onClick={criarNova} loading={pendente}>
                <Plus size={14} />
                Criar
              </Button>
            </div>
          </div>
        </RevelarScroll>
      )}

      <RevelarScroll atraso={0.06}>
        <div className="painel-chat">
          {/* lista de conversas */}
          <div className="painel-chat-col">
            <div className="painel-chat-col-titulo">Conversas</div>
            <div className="flex-1 overflow-y-auto">
              {conversas.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => carregarMensagens(c.id)}
                  className={cn('painel-chat-item', selecionada === c.id && 'painel-chat-item--ativo')}
                >
                  <p style={{ fontWeight: 500, fontSize: '0.82rem', color: 'var(--color-text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.assunto ?? 'Sem assunto'}
                  </p>
                  <p style={{ fontSize: '0.73rem', color: 'var(--color-text-3)', marginTop: '0.06rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.empresas?.nome_fantasia}
                  </p>
                  <p style={{ fontSize: '0.68rem', color: 'var(--color-text-3)', marginTop: '0.2rem' }}>
                    {formatarDataHora(c.atualizado_em)}
                  </p>
                </button>
              ))}
              {conversas.length === 0 && (
                <p style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-3)' }}>
                  Nenhuma conversa.
                </p>
              )}
            </div>
          </div>

          {/* área de mensagens */}
          <div className="painel-chat-col">
            {conversaAtual ? (
              <>
                <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid var(--color-border)' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-1)' }}>{conversaAtual.assunto}</p>
                  <p style={{ fontSize: '0.73rem', color: 'var(--color-text-3)' }}>{conversaAtual.empresas?.nome_fantasia}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {mensagens.length === 0 && (
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-3)', paddingTop: '2rem' }}>
                      Nenhuma mensagem ainda.
                    </p>
                  )}
                  {mensagens.map((m) => {
                    const propria = m.remetente_id === perfilId
                    return (
                      <div key={m.id} className={cn('flex gap-2 items-end', propria && 'flex-row-reverse')}>
                        <Avatar name={m.perfis?.nome_completo ?? '?'} size="sm" />
                        <div className={cn('painel-chat-bolha', propria ? 'painel-chat-bolha--minha' : 'painel-chat-bolha--deles')}>
                          {m.corpo}
                          <p style={{ fontSize: '0.65rem', marginTop: '0.25rem', opacity: 0.6 }}>
                            {formatarDataHora(m.criado_em)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ padding: '0.65rem 0.85rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem' }}>
                  <input
                    className="painel-chat-input"
                    placeholder="Digite sua mensagem..."
                    value={texto}
                    onChange={(e) => definirTexto(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && aoEnviar()}
                  />
                  <Button variant="primary" size="sm" onClick={aoEnviar} loading={pendente}>
                    <Send size={14} />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-2" style={{ color: 'var(--color-text-3)' }}>
                <MessageSquare size={28} style={{ opacity: 0.35 }} />
                <p style={{ fontSize: '0.8rem' }}>Selecione uma conversa</p>
              </div>
            )}
          </div>
        </div>
      </RevelarScroll>
    </SecaoPainel>
  )
}
