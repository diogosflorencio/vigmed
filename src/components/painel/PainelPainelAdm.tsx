import { PainelEstatisticasAdm } from '@/components/painel/PainelEstatisticasAdm'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { IconeAnimado } from '@/components/ui/icone-animado'
import type { EstatisticasPainelAdmin } from '@/types'

interface Props {
  estatisticas: EstatisticasPainelAdmin
}

export function PainelPainelAdm({ estatisticas }: Props) {
  const { empresas: e, usuarios: u, documentos: d } = estatisticas

  return (
    <div className="painel-adm-layout">
      <RevelarScroll>
        <div className="vig-hero-painel vig-hero-painel--adm">
          <div>
            <p className="vig-landing-kicker" style={{ marginBottom: '0.35rem' }}>Administração</p>
            <h2>Visão geral da plataforma</h2>
            <p>
              {e.ativas} empresas ativas · {u.ativos} usuários · {d.ativos} documentos no sistema.
            </p>
          </div>
          <div className="vig-hero-painel-icone" aria-hidden>
            <IconeAnimado nome="chart-bar" tamanho={28} />
          </div>
        </div>
      </RevelarScroll>

      <PainelEstatisticasAdm dados={estatisticas} />
    </div>
  )
}
