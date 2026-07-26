import { formatarBytes } from '@/lib/utils'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { CartaoMetrica } from '@/components/layout/CartaoMetrica'
import { SecaoPainel, CartaoPainel } from '@/components/layout/SecaoPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { Building2, FileText, HardDrive, Users } from 'lucide-react'
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
  return (
    <SecaoPainel>
      <CabecalhoPagina
        titulo="Relatórios"
        descricao="Visão consolidada de uso e métricas da plataforma."
      />

      <RevelarScroll>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <CartaoMetrica titulo="Empresas ativas" valor={dados.empresasAtivas} icone={<Building2 size={16} />} />
          <CartaoMetrica titulo="Usuários ativos" valor={dados.usuariosAtivos} icone={<Users size={16} />} />
          <CartaoMetrica titulo="Documentos" valor={dados.documentosAtivos} icone={<FileText size={16} />} />
          <CartaoMetrica titulo="Armazenamento total" valor={formatarBytes(dados.armazenamentoTotal)} icone={<HardDrive size={16} />} />
        </div>
      </RevelarScroll>

      <RevelarScroll atraso={0.06}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CartaoPainel titulo="Empresas por status">
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {Object.entries(dados.contagemStatus).map(([status, qtd]) => (
                <li key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--color-text-2)', textTransform: 'capitalize' }}>
                    {STATUS_ROTULOS[status] ?? status}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-1)' }}>{qtd}</span>
                </li>
              ))}
            </ul>
          </CartaoPainel>

          <CartaoPainel titulo="Maior uso de armazenamento">
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {dados.topArmazenamento.map((e) => {
                const pct = e.armazenamento_limite
                  ? Math.min((e.armazenamento_usado / e.armazenamento_limite) * 100, 100)
                  : 0
                return (
                  <li key={e.nome_fantasia}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-1)' }}>{e.nome_fantasia}</span>
                      <span style={{ fontSize: '0.73rem', color: 'var(--color-text-3)' }}>{formatarBytes(e.armazenamento_usado)}</span>
                    </div>
                    <div className="barra-uso">
                      <div
                        className={pct >= 90 ? 'barra-uso-fill barra-uso-fill--alerta' : 'barra-uso-fill'}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </CartaoPainel>
        </div>
      </RevelarScroll>
    </SecaoPainel>
  )
}
