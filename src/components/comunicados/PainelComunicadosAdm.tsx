'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Pin, Search, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { Button } from '@/components/ui'
import { publicarComunicado } from '@/lib/comunicados/acoes'
import { cn, formatarDataHora } from '@/lib/utils'
import type { Comunicado, PrioridadeComunicado } from '@/types'

type Aba = 'ativos' | 'rascunhos' | 'historico'

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'ativos', rotulo: 'Ativos' },
  { id: 'rascunhos', rotulo: 'Rascunhos' },
  { id: 'historico', rotulo: 'Histórico' },
]

interface Props {
  comunicadosIniciais: Comunicado[]
  empresas: { id: string; nome_fantasia: string }[]
}

export function PainelComunicadosAdm({ comunicadosIniciais, empresas }: Props) {
  const router = useRouter()
  const [aba, definirAba] = useState<Aba>('ativos')
  const [busca, definirBusca] = useState('')
  const [pendente, iniciarTransicao] = useTransition()

  const [titulo, definirTitulo] = useState('')
  const [corpo, definirCorpo] = useState('')
  const [prioridade, definirPrioridade] = useState<PrioridadeComunicado>('normal')
  const [paraTodos, definirParaTodos] = useState(true)
  const [empresaIds, definirEmpresaIds] = useState<string[]>([])

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

  function enviar(rascunho: boolean) {
    if (!titulo.trim() || !corpo.trim()) {
      toast.error('Preencha título e mensagem.')
      return
    }
    iniciarTransicao(async () => {
      const resultado = await publicarComunicado({
        titulo, corpo, prioridade, paraTodos,
        empresaIds: paraTodos ? undefined : empresaIds,
        rascunho,
      })
      if (resultado.erro) { toast.error(resultado.erro); return }
      toast.success(rascunho ? 'Rascunho salvo.' : 'Comunicado publicado.')
      definirTitulo('')
      definirCorpo('')
      router.refresh()
    })
  }

  return (
    <SecaoPainel>
      <CabecalhoPagina
        titulo="Comunicados"
        descricao="Gerencie e publique avisos para a rede de empresas parceiras."
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">

        {/* -- coluna lista -- */}
        <section className="xl:col-span-7 flex flex-col gap-4">
          <RevelarScroll>
            <div className="painel-filtros">
              <div className="painel-busca" style={{ minWidth: 160 }}>
                <Search size={13} className="painel-busca-icone" />
                <input
                  className="painel-busca-input"
                  placeholder="Buscar comunicados..."
                  value={busca}
                  onChange={(e) => definirBusca(e.target.value)}
                />
              </div>
              <div className="painel-pilulas">
                {ABAS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => definirAba(a.id)}
                    className={cn('painel-pilula', aba === a.id && 'painel-pilula--ativo')}
                  >
                    {a.rotulo}
                  </button>
                ))}
              </div>
            </div>
          </RevelarScroll>

          <div className="flex flex-col gap-3">
            {comunicados.map((c, i) => (
              <RevelarScroll key={c.id} atraso={i * 0.04}>
                <div className={cn('comunicado-card', c.fixado && 'comunicado-card--fixado')}>
                  {c.fixado && (
                    <div className="comunicado-card-barra">
                      <span className="flex items-center gap-1.5"><Pin size={11} /> Fixado</span>
                      <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--color-text-3)' }}>
                        {formatarDataHora(c.publicado_em)}
                      </span>
                    </div>
                  )}
                  <div className="comunicado-card-corpo">
                    <div className="flex justify-between items-start gap-2">
                      <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-1)' }}>{c.titulo}</h3>
                      <span className={cn('badge-prioridade', `prioridade-${c.prioridade}`)}>{c.prioridade}</span>
                    </div>
                    {!c.fixado && (
                      <span className="tabela-mono">{formatarDataHora(c.publicado_em)}</span>
                    )}
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-2)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.corpo}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid var(--color-border)', fontSize: '0.73rem', color: 'var(--color-text-3)' }}>
                      <Eye size={13} />
                      {c.para_todos ? 'Todas as empresas' : 'Empresas selecionadas'}
                    </div>
                  </div>
                </div>
              </RevelarScroll>
            ))}

            {comunicados.length === 0 && (
              <RevelarScroll>
                <div className="painel-vazio painel-card">
                  <IconeAnimado nome="megaphone" tamanho={24} className="opacity-40" />
                  Nenhum comunicado nesta aba.
                </div>
              </RevelarScroll>
            )}
          </div>
        </section>

        {/* -- formulário lateral -- */}
        <section className="xl:col-span-5 xl:sticky xl:top-24">
          <RevelarScroll atraso={0.08}>
            <div className="painel-form-lateral">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <IconeAnimado nome="megaphone" tamanho={16} />
                <span className="painel-form-titulo">Novo Comunicado</span>
              </div>

              <div className="painel-campo">
                <label className="painel-label">Título</label>
                <input className="painel-input" placeholder="Ex: Atualização de Sistema" value={titulo} onChange={(e) => definirTitulo(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="painel-campo">
                  <label className="painel-label">Prioridade</label>
                  <select className="painel-select" style={{ width: '100%' }} value={prioridade} onChange={(e) => definirPrioridade(e.target.value as PrioridadeComunicado)}>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
                <div className="painel-campo">
                  <label className="painel-label">Destinatários</label>
                  <select className="painel-select" style={{ width: '100%' }} value={paraTodos ? 'all' : 'sel'} onChange={(e) => definirParaTodos(e.target.value === 'all')}>
                    <option value="all">Todas as empresas</option>
                    <option value="sel">Selecionar...</option>
                  </select>
                </div>
              </div>

              {!paraTodos && (
                <div className="painel-checkbox-lista">
                  {empresas.map((e) => (
                    <label key={e.id} className="painel-checkbox-item">
                      <input
                        type="checkbox"
                        checked={empresaIds.includes(e.id)}
                        onChange={(ev) => {
                          if (ev.target.checked) definirEmpresaIds([...empresaIds, e.id])
                          else definirEmpresaIds(empresaIds.filter((id) => id !== e.id))
                        }}
                      />
                      {e.nome_fantasia}
                    </label>
                  ))}
                </div>
              )}

              <div className="painel-campo">
                <label className="painel-label">Mensagem</label>
                <textarea
                  className="painel-textarea"
                  rows={5}
                  placeholder="Escreva o conteúdo do comunicado..."
                  value={corpo}
                  onChange={(e) => definirCorpo(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" loading={pendente} onClick={() => enviar(true)}>
                  Salvar Rascunho
                </Button>
                <Button variant="primary" size="sm" loading={pendente} onClick={() => enviar(false)}>
                  <Send size={14} />
                  Publicar
                </Button>
              </div>
            </div>
          </RevelarScroll>
        </section>
      </div>
    </SecaoPainel>
  )
}
