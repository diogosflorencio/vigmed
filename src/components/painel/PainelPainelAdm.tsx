import { PainelEstatisticasAdm } from '@/components/painel/PainelEstatisticasAdm'
import { PainelPendenciasAdm } from '@/components/painel/PainelPendenciasAdm'
import { PainelAtividadeRecenteAdm } from '@/components/painel/PainelAtividadeRecenteAdm'
import { PainelAcessoRapidoAdm } from '@/components/painel/PainelAcessoRapidoAdm'
import { PainelConsumoAdm } from '@/components/painel/PainelConsumoAdm'
import { BannerPainel } from '@/components/painel/BannerPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { hrefPublico, ROTAS } from '@/lib/rotas'
import { formatarBytes } from '@/lib/utils'
import type { EstatisticasPainelAdmin } from '@/types'
import type { PendenciasAdmin } from '@/lib/painel/acoes'
import type { RegistroAuditoria } from '@/lib/auditoria/acoes'
import type { PainelConsumo } from '@/lib/painel/consumo'

interface Props {
  estatisticas: EstatisticasPainelAdmin
  pendencias: PendenciasAdmin
  atividadeRecente: RegistroAuditoria[]
  consumo: PainelConsumo
}

export function PainelPainelAdm({
  estatisticas,
  pendencias,
  atividadeRecente,
  consumo,
}: Props) {
  const { empresas: e, usuarios: u, documentos: d } = estatisticas
  const alertas = pendencias.alertasValidade.length
  const msgs = pendencias.mensagensNaoLidas
  const convites = pendencias.convitesPendentes
  const retencao = pendencias.retencaoPendente
  const topEmpresa = consumo.empresas[0]
  const topUsuario = consumo.usuarios[0]
  const r2 = consumo.infra.find((i) => i.id === 'cloudflare')

  const chips = [
    {
      rotulo: 'R2 em uso',
      valor: r2?.resumo ?? formatarBytes(e.armazenamentoUsado),
      tom: 'neutro' as const,
    },
    {
      rotulo: 'empresas ativas',
      valor: e.ativas,
      tom: 'neutro' as const,
      href: hrefPublico(ROTAS.adm.empresas),
    },
    {
      rotulo: 'usuários',
      valor: u.ativos,
      tom: 'neutro' as const,
      href: hrefPublico(ROTAS.adm.usuarios),
    },
  ]

  if (msgs > 0) {
    chips.push({
      rotulo: msgs === 1 ? 'mensagem nova' : 'mensagens novas',
      valor: msgs,
      tom: 'sinal',
      href: hrefPublico(ROTAS.adm.mensagens),
    })
  }
  if (alertas > 0) {
    chips.push({
      rotulo: alertas === 1 ? 'alerta de validade' : 'alertas de validade',
      valor: alertas,
      tom: 'alerta',
      href: hrefPublico(ROTAS.adm.documentos),
    })
  }
  if (convites > 0) {
    chips.push({
      rotulo: convites === 1 ? 'convite pendente' : 'convites pendentes',
      valor: convites,
      tom: 'sinal',
      href: hrefPublico(ROTAS.adm.usuarios),
    })
  }
  if (retencao > 0) {
    chips.push({
      rotulo: 'retenção',
      valor: retencao,
      tom: 'risco',
      href: hrefPublico(ROTAS.adm.documentos),
    })
  }

  const textoConsumo = [
    topEmpresa
      ? `Maior consumo: ${topEmpresa.nome} (${formatarBytes(topEmpresa.bytes)}).`
      : null,
    topUsuario
      ? `Usuário mais ativo: ${topUsuario.nome} (${formatarBytes(topUsuario.bytesEnviados)} enviados).`
      : null,
    `${e.ativas} empresas, ${u.ativos} usuários, ${d.ativos} documentos.`,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="painel-adm-layout">
      <RevelarScroll>
        <BannerPainel
          kicker="Administração"
          titulo="Consumo sob controle."
          texto={textoConsumo}
          chips={chips}
          cta={{ rotulo: 'Ver empresas', href: hrefPublico(ROTAS.adm.empresas) }}
        />
      </RevelarScroll>

      <PainelConsumoAdm consumo={consumo} />

      <PainelPendenciasAdm pendencias={pendencias} />

      <PainelAcessoRapidoAdm />

      <PainelAtividadeRecenteAdm registros={atividadeRecente} />

      <PainelEstatisticasAdm dados={estatisticas} />
    </div>
  )
}
