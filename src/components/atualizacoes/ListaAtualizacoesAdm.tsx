import { ATUALIZACOES_VIGMED, VERSAO_ATUAL } from '@/lib/atualizacoes/dados'

function metade(lista: typeof ATUALIZACOES_VIGMED, parte: 0 | 1) {
  const corte = Math.ceil(lista.length / 2)
  return parte === 0 ? lista.slice(0, corte) : lista.slice(corte)
}

function ColunaAtualizacoes({ registros }: { registros: typeof ATUALIZACOES_VIGMED }) {
  return (
    <div className="painel-estat-col">
      {registros.map((reg) => (
        <section key={reg.versao} className="painel-estat-secao">
          <h2 className="painel-estat-secao-titulo">
            v{reg.versao} · {reg.data}
          </h2>
          <p className="painel-estat-texto">{reg.itens.join(' · ')}</p>
        </section>
      ))}
    </div>
  )
}

/** Lista de versões, mesmo estilo do painel */
export function ListaAtualizacoesAdm() {
  return (
    <article className="painel-estatisticas" aria-label="Atualizações da plataforma">
      <header className="painel-estat-topo">
        <h1 className="painel-estat-titulo">Atualizações</h1>
        <p className="painel-estat-texto">
          Versão atual <strong className="painel-estat-num">v{VERSAO_ATUAL}</strong>. Histórico de
          junho/2026.
        </p>
      </header>

      <div className="painel-estat-grid">
        <ColunaAtualizacoes registros={metade(ATUALIZACOES_VIGMED, 0)} />
        <ColunaAtualizacoes registros={metade(ATUALIZACOES_VIGMED, 1)} />
      </div>
    </article>
  )
}
