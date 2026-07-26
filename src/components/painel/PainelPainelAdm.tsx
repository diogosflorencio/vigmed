import { PainelEstatisticasAdm } from '@/components/painel/PainelEstatisticasAdm'
import type { EstatisticasPainelAdmin } from '@/types'

interface Props {
  estatisticas: EstatisticasPainelAdmin
}

export function PainelPainelAdm({ estatisticas }: Props) {
  return (
    <div className="painel-adm-layout">
      <PainelEstatisticasAdm dados={estatisticas} />
    </div>
  )
}
