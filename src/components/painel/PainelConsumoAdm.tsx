import Link from 'next/link'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { Cartao } from '@/components/vig/Cartao'
import { hrefPublico, ROTAS } from '@/lib/rotas'
import { formatarBytes, formatarDataHora } from '@/lib/utils'
import type { PainelConsumo } from '@/lib/painel/consumo'

interface Props {
  consumo: PainelConsumo
}

function Barra({ pct }: { pct: number }) {
  return (
    <div className="vig-barra-progresso" aria-hidden>
      <div className="vig-barra-progresso-fill" style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  )
}

/** Núcleo do painel: quem gasta, com o quê, e saúde Supabase / R2 / Vercel */
export function PainelConsumoAdm({ consumo }: Props) {
  return (
    <div className="vm-consumo">
      <RevelarScroll>
        <div className="vm-consumo-infra">
          {consumo.infra.map((bloco) => (
            <article key={bloco.id} className={`vm-consumo-infra-card vm-consumo-infra-card--${bloco.id}`}>
              <header>
                <p className="vm-consumo-kicker">{bloco.papel}</p>
                <h3>{bloco.nome}</h3>
                <p className="vm-consumo-resumo">{bloco.resumo}</p>
              </header>
              <ul>
                {bloco.itens.map((item) => (
                  <li key={item.rotulo}>
                    <span>{item.rotulo}</span>
                    <strong>{item.valor}</strong>
                  </li>
                ))}
              </ul>
              <p className="vm-consumo-obs">{bloco.observacao}</p>
            </article>
          ))}
        </div>
      </RevelarScroll>

      <div className="vm-consumo-grid">
        <RevelarScroll atraso={0.03}>
          <Cartao
            titulo="Empresas que mais consomem"
            descricao="Armazenamento R2 por empresa (cota e uso)."
          >
            {consumo.empresas.length === 0 ? (
              <p className="vm-consumo-vazio">Nenhuma empresa ativa com consumo.</p>
            ) : (
              <ul className="vm-consumo-lista">
                {consumo.empresas.map((e, i) => (
                  <li key={e.id}>
                    <Link href={hrefPublico(ROTAS.adm.empresa(e.id))} className="vm-consumo-linha">
                      <span className="vm-consumo-rank">{i + 1}</span>
                      <span className="vm-consumo-nome">
                        <strong>{e.nome}</strong>
                        <small>
                          Empresa {formatarBytes(e.bytesEmpresa)} · VIGMED {formatarBytes(e.bytesVigmed)}
                        </small>
                      </span>
                      <span className="vm-consumo-valor">
                        <strong>{formatarBytes(e.bytes)}</strong>
                        <small>
                          {e.limite > 0 ? `${e.pct}% de ${formatarBytes(e.limite)}` : 'sem cota'}
                        </small>
                      </span>
                    </Link>
                    {e.limite > 0 && <Barra pct={e.pct} />}
                  </li>
                ))}
              </ul>
            )}
          </Cartao>
        </RevelarScroll>

        <RevelarScroll atraso={0.05}>
          <Cartao
            titulo="Usuários com mais gasto"
            descricao="Bytes enviados + uploads/downloads nos últimos 7 dias."
          >
            {consumo.usuarios.length === 0 ? (
              <p className="vm-consumo-vazio">Sem atividade recente para ranquear.</p>
            ) : (
              <ul className="vm-consumo-lista">
                {consumo.usuarios.map((u, i) => (
                  <li key={u.id}>
                    <div className="vm-consumo-linha">
                      <span className="vm-consumo-rank">{i + 1}</span>
                      <span className="vm-consumo-nome">
                        <strong>{u.nome}</strong>
                        <small>
                          {u.email}
                          {u.empresa ? ` · ${u.empresa}` : ''}
                        </small>
                      </span>
                      <span className="vm-consumo-valor">
                        <strong>{formatarBytes(u.bytesEnviados)}</strong>
                        <small>
                          {u.uploads7d} up · {u.downloads7d} down (7d)
                        </small>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="vm-consumo-rodape">
              Atualizado {formatarDataHora(consumo.atualizadoEm)} · cache 60s
            </p>
          </Cartao>
        </RevelarScroll>
      </div>
    </div>
  )
}
