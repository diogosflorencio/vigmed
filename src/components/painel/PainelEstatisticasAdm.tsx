import type { EstatisticasPainelAdmin } from '@/types'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { Cartao } from '@/components/vig/Cartao'
import { Metrica } from '@/components/vig/Metrica'
import { formatarBytes } from '@/lib/utils'

interface Props {
  dados: EstatisticasPainelAdmin
}

function BarraProgresso({ pct }: { pct: number }) {
  return (
    <div className="vig-barra-progresso" aria-hidden>
      <div className="vig-barra-progresso-fill" style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  )
}

/** Dashboard admin visual com métricas e cartões VIGMED */
export function PainelEstatisticasAdm({ dados }: Props) {
  const { empresas: e, usuarios: u, documentos: d, comunicados: c, mensagens: m, convites: v, auditoria: a } = dados

  const pctArmazenamento =
    e.armazenamentoLimite > 0 ? Math.round((e.armazenamentoEmpresas / e.armazenamentoLimite) * 100) : 0

  return (
    <div className="vig-dashboard-adm">
      <RevelarScroll atraso={0.04}>
        <div className="vig-metrica-grid vig-metrica-grid--4">
          <Metrica rotulo="Empresas ativas" valor={e.ativas} icone={<IconeAnimado nome="building" tamanho={16} />} destaque />
          <Metrica rotulo="Usuários ativos" valor={u.ativos} icone={<IconeAnimado nome="users" tamanho={16} />} />
          <Metrica rotulo="Documentos ativos" valor={d.ativos} icone={<IconeAnimado nome="file-text" tamanho={16} />} />
          <Metrica rotulo="Eventos (24h)" valor={a.eventos24h} icone={<IconeAnimado nome="activity" tamanho={16} />} />
        </div>
      </RevelarScroll>

      <div className="vig-dashboard-adm-grid">
        <RevelarScroll atraso={0.06}>
          <Cartao titulo="Empresas" descricao="Status e armazenamento">
            <div className="vig-metrica-grid vig-metrica-grid--3 vig-metrica-grid--inline">
              <Metrica rotulo="Ativas" valor={e.ativas} />
              <Metrica rotulo="Inativas" valor={e.inativas} />
              <Metrica rotulo="Suspensas" valor={e.suspensas} />
            </div>
            <div className="vig-dashboard-detalhe">
              <p>
                Cota empresas: <strong>{formatarBytes(e.armazenamentoEmpresas)}</strong> de{' '}
                <strong>{formatarBytes(e.armazenamentoLimite)}</strong> ({pctArmazenamento}%)
              </p>
              <BarraProgresso pct={pctArmazenamento} />
              <p className="vig-dashboard-detalhe-sub">
                VIGMED {formatarBytes(e.armazenamentoVigmed)} · Total {formatarBytes(e.armazenamentoUsado)}
              </p>
            </div>
          </Cartao>
        </RevelarScroll>

        <RevelarScroll atraso={0.08}>
          <Cartao titulo="Usuários" descricao="Perfis e acessos recentes">
            <div className="vig-metrica-grid vig-metrica-grid--3 vig-metrica-grid--inline">
              <Metrica rotulo="Admin sistema" valor={u.administradores} />
              <Metrica rotulo="Admin empresa" valor={u.administradoresEmpresa} />
              <Metrica rotulo="Usu. empresa" valor={u.usuariosEmpresa} />
            </div>
            <p className="vig-dashboard-detalhe-sub">
              {u.loginsRecentes} logins nos últimos 7 dias · {u.inativos} inativos
            </p>
          </Cartao>
        </RevelarScroll>

        <RevelarScroll atraso={0.1}>
          <Cartao titulo="Documentos" descricao="Volume e atividade recente">
            <div className="vig-metrica-grid vig-metrica-grid--2 vig-metrica-grid--inline">
              <Metrica rotulo="Criados 7d" valor={d.criados7d} />
              <Metrica rotulo="Uploads 7d" valor={d.uploads7d} />
              <Metrica rotulo="Downloads 7d" valor={d.downloads7d} />
              <Metrica rotulo="Downloads total" valor={d.somaDownloads} />
            </div>
            <p className="vig-dashboard-detalhe-sub">
              {d.categorias} categorias · {formatarBytes(d.somaTamanho)} armazenados
            </p>
          </Cartao>
        </RevelarScroll>

        <RevelarScroll atraso={0.12}>
          <Cartao titulo="Engajamento" descricao="Comunicados, mensagens e convites">
            <div className="vig-metrica-grid vig-metrica-grid--2 vig-metrica-grid--inline">
              <Metrica rotulo="Comunicados ativos" valor={c.ativos} />
              <Metrica rotulo="Leituras" valor={c.leituras} />
              <Metrica rotulo="Mensagens 7d" valor={m.mensagens7d} />
              <Metrica rotulo="Convites pendentes" valor={v.pendentes} />
            </div>
            <p className="vig-dashboard-detalhe-sub">
              {m.conversasAtivas} conversas · {v.aceitos30d} convites aceitos (30d)
            </p>
          </Cartao>
        </RevelarScroll>

        <RevelarScroll atraso={0.14}>
          <Cartao titulo="Auditoria" descricao="Últimos 7 dias">
            <div className="vig-metrica-grid vig-metrica-grid--2 vig-metrica-grid--inline">
              <Metrica rotulo="Logins" valor={a.logins7d} />
              <Metrica rotulo="Envios" valor={a.envios7d} />
              <Metrica rotulo="Downloads" valor={a.downloads7d} />
              <Metrica rotulo="Eventos" valor={a.eventos7d} />
            </div>
          </Cartao>
        </RevelarScroll>
      </div>
    </div>
  )
}
