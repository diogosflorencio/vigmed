'use client'

import { Fragment, useState } from 'react'
import { ChevronDown, ChevronUp, Download, Search, Shield } from 'lucide-react'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { Button } from '@/components/ui'
import type { RegistroAuditoria } from '@/lib/auditoria/acoes'
import { cn, formatarDataHora } from '@/lib/utils'

interface Props {
  registros: RegistroAuditoria[]
  total: number
  pagina: number
  porPagina: number
  totalPaginas: number
}

function exportarCsv(registros: RegistroAuditoria[]) {
  const cabecalho = 'Data,Evento,Usuário,Empresa,IP\n'
  const linhas = registros.map((r) =>
    [formatarDataHora(r.criado_em), r.acao, r.perfis?.email ?? '', r.empresas?.nome_fantasia ?? '', r.endereco_ip ?? ''].join(','),
  )
  const blob = new Blob([cabecalho + linhas.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `auditoria-vigmed-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const ACOES_FILTRO = [
  { valor: '', rotulo: 'Todos os eventos' },
  { valor: 'login', rotulo: 'Login' },
  { valor: 'download', rotulo: 'Download' },
  { valor: 'envio', rotulo: 'Upload' },
  { valor: 'criacao_empresa', rotulo: 'Criação empresa' },
  { valor: 'atualizacao_empresa', rotulo: 'Atualização empresa' },
]

export function PainelAuditoria({ registros, total, pagina, porPagina, totalPaginas }: Props) {
  const [busca, definirBusca] = useState('')
  const [acaoFiltro, definirAcaoFiltro] = useState('')
  const [expandido, definirExpandido] = useState<string | null>(null)

  const filtrados = registros.filter((r) => {
    if (acaoFiltro && r.acao !== acaoFiltro) return false
    if (!busca.trim()) return true
    const termo = busca.toLowerCase()
    return (
      r.acao.toLowerCase().includes(termo) ||
      r.perfis?.email?.toLowerCase().includes(termo) ||
      (r.endereco_ip ?? '').includes(termo)
    )
  })

  const inicio = (pagina - 1) * porPagina + 1
  const fim = Math.min(pagina * porPagina, total)

  return (
    <SecaoPainel>
      <CabecalhoPagina
        rotulo="Módulo Administrativo"
        titulo="Auditoria de Sistema"
        descricao="Registro imutável de eventos de segurança e ações de usuários."
        acoes={
          <Button variant="outline" size="sm" onClick={() => exportarCsv(filtrados)}>
            <Download size={14} />
            Exportar CSV
          </Button>
        }
      />

      <RevelarScroll>
        <div className="painel-filtros">
          <div className="painel-busca" style={{ minWidth: 180 }}>
            <Search size={13} className="painel-busca-icone" />
            <input
              className="painel-busca-input"
              placeholder="Buscar usuário, evento ou IP..."
              value={busca}
              onChange={(e) => definirBusca(e.target.value)}
            />
          </div>
          <div className="painel-pilulas">
            {ACOES_FILTRO.map((f) => (
              <button
                key={f.valor}
                type="button"
                onClick={() => definirAcaoFiltro(f.valor)}
                className={cn('painel-pilula', acaoFiltro === f.valor && 'painel-pilula--ativo')}
              >
                {f.rotulo}
              </button>
            ))}
          </div>
        </div>
      </RevelarScroll>

      <RevelarScroll atraso={0.06}>
        <div className="painel-tabela-wrap">
          <div className="overflow-x-auto">
            <table className="painel-tabela">
              <thead className="painel-tabela-thead">
                <tr>
                  <th>Data / Hora</th>
                  <th>Evento</th>
                  <th>Usuário</th>
                  <th className="hidden md:table-cell">Empresa</th>
                  <th>IP</th>
                  <th className="text-center">Detalhes</th>
                </tr>
              </thead>
              <tbody className="painel-tabela-tbody">
                {filtrados.map((r) => {
                  const falha = r.acao.includes('fail') || r.acao === 'bloqueio_usuario'
                  const aberto = expandido === r.id
                  return (
                    <Fragment key={r.id}>
                      <tr className={cn(falha && 'bg-(--color-danger-bg)', aberto && 'border-l-2 border-l-(--color-accent)')}>
                        <td className="tabela-mono whitespace-nowrap">{formatarDataHora(r.criado_em)}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <span className={cn('ponto-status', falha ? 'ponto-status--falha' : 'ponto-status--ok')} />
                            <span style={{
                              fontSize: '0.8rem', fontWeight: 600,
                              color: falha ? 'var(--color-danger)' : 'var(--color-text-1)',
                              letterSpacing: '0.02em',
                            }}>
                              {r.acao.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--color-text-2)' }}>{r.perfis?.email ?? '-'}</td>
                        <td className="hidden md:table-cell tabela-mono">{r.empresas?.nome_fantasia ?? '-'}</td>
                        <td className={cn('tabela-mono', falha && 'text-(--color-danger)')}>{r.endereco_ip ?? '-'}</td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="tabela-acao mx-auto"
                            onClick={() => definirExpandido(aberto ? null : r.id)}
                          >
                            {aberto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>
                      {aberto && (
                        <tr>
                          <td colSpan={6} style={{ padding: '0 0.85rem 0.75rem' }}>
                            <pre className="painel-payload">
                              {JSON.stringify(r.detalhes, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filtrados.length === 0 ? (
            <div className="painel-vazio">
              <Shield size={22} style={{ opacity: 0.35 }} />
              Nenhum registro encontrado.
            </div>
          ) : (
            <div className="painel-tabela-rodape">
              <span>Mostrando {inicio} a {fim} de {total.toLocaleString('pt-BR')} registros</span>
              <span>Página {pagina} de {totalPaginas || 1}</span>
            </div>
          )}
        </div>
      </RevelarScroll>
    </SecaoPainel>
  )
}
