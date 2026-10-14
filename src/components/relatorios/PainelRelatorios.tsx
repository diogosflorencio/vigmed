'use client'

import toast from 'react-hot-toast'
import { formatarBytes } from '@/lib/utils'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel, CartaoPainel } from '@/components/layout/SecaoPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { Metrica } from '@/components/vig/Metrica'
import { Botao } from '@/components/vig/Botao'
import { Vazio } from '@/components/vig/Vazio'
import type { DadosRelatorios } from '@/lib/relatorios/acoes'

interface Props {
  dados: DadosRelatorios
}

const STATUS_ROTULOS: Record<string, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  suspenso: 'Suspenso',
}

export function PainelRelatorios({ dados }: Props) {
  const entradasStatus = Object.entries(dados.contagemStatus)
  const temTop = dados.topArmazenamento.length > 0

  function exportarCsv() {
    const linhas = [
      ['Métrica', 'Valor'].join(';'),
      ['Empresas ativas', dados.empresasAtivas].join(';'),
      ['Usuários ativos', dados.usuariosAtivos].join(';'),
      ['Documentos ativos', dados.documentosAtivos].join(';'),
      ['Documentos vencendo (30d)', dados.documentosVencendo].join(';'),
      ['Documentos vencidos', dados.documentosVencidos].join(';'),
      ['Comunicados ativos', dados.comunicadosAtivos].join(';'),
      ['Mensagens (7d)', dados.mensagens7d].join(';'),
      ['Armazenamento total', dados.armazenamentoTotal].join(';'),
      '',
      ['Empresa', 'Usado (bytes)', 'Limite (bytes)', 'Usado'].join(';'),
      ...dados.topArmazenamento.map((e) =>
        [
          `"${e.nome_fantasia.replace(/"/g, '""')}"`,
          e.armazenamento_usado,
          e.armazenamento_limite,
          formatarBytes(e.armazenamento_usado),
        ].join(';'),
      ),
      '',
      ['Status', 'Quantidade'].join(';'),
      ...entradasStatus.map(([s, q]) => [STATUS_ROTULOS[s] ?? s, q].join(';')),
    ]
    const blob = new Blob([`\uFEFF${linhas.join('\n')}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-vigmed-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Relatório exportado.')
  }

  return (
    <SecaoPainel>
      <CabecalhoPagina
        rotulo="Administração"
        titulo="Relatórios"
        descricao="Visão consolidada de uso da plataforma."
        acoes={
          <Botao variante="secundario" tamanho="sm" onClick={exportarCsv} filho="Exportar CSV" />
        }
      />

      <RevelarScroll>
        <div className="vig-metrica-grid vig-metrica-grid--4">
          <Metrica rotulo="Empresas ativas" valor={dados.empresasAtivas} />
          <Metrica rotulo="Usuários ativos" valor={dados.usuariosAtivos} />
          <Metrica rotulo="Documentos" valor={dados.documentosAtivos} />
          <Metrica rotulo="Armazenamento" valor={formatarBytes(dados.armazenamentoTotal)} />
        </div>
      </RevelarScroll>

      <RevelarScroll atraso={0.04}>
        <div className="vig-metrica-grid vig-metrica-grid--4">
          <Metrica rotulo="Docs vencendo (30d)" valor={dados.documentosVencendo} destaque={dados.documentosVencendo > 0} />
          <Metrica rotulo="Docs vencidos" valor={dados.documentosVencidos} destaque={dados.documentosVencidos > 0} />
          <Metrica rotulo="Comunicados ativos" valor={dados.comunicadosAtivos} />
          <Metrica rotulo="Mensagens (7d)" valor={dados.mensagens7d} />
        </div>
      </RevelarScroll>

      <RevelarScroll atraso={0.06}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CartaoPainel titulo="Empresas por status">
            {entradasStatus.length === 0 ? (
              <Vazio titulo="Sem empresas cadastradas" compacto />
            ) : (
              <ul className="vig-lista-relatorio">
                {entradasStatus.map(([status, qtd]) => (
                  <li key={status} className="vig-lista-relatorio-item">
                    <span>{STATUS_ROTULOS[status] ?? status}</span>
                    <strong>{qtd}</strong>
                  </li>
                ))}
              </ul>
            )}
          </CartaoPainel>

          <CartaoPainel titulo="Maior uso de armazenamento">
            {!temTop ? (
              <Vazio titulo="Nenhum uso registrado" compacto />
            ) : (
              <ul className="vig-lista-armazenamento">
                {dados.topArmazenamento.map((e) => {
                  const pct = e.armazenamento_limite
                    ? Math.min((e.armazenamento_usado / e.armazenamento_limite) * 100, 100)
                    : 0
                  return (
                    <li key={e.nome_fantasia}>
                      <div className="vig-lista-armazenamento-topo">
                        <span>{e.nome_fantasia}</span>
                        <span>{formatarBytes(e.armazenamento_usado)}</span>
                      </div>
                      <div className="vig-barra-progresso">
                        <div
                          className={`vig-barra-progresso-fill${pct >= 90 ? ' vig-barra-progresso-fill--alerta' : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CartaoPainel>
        </div>
      </RevelarScroll>
    </SecaoPainel>
  )
}
