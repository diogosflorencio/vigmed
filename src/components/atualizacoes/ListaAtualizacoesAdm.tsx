import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel, CartaoPainel } from '@/components/layout/SecaoPainel'
import { ATUALIZACOES_VIGMED, VERSAO_ATUAL } from '@/lib/atualizacoes/dados'

function metade(lista: typeof ATUALIZACOES_VIGMED, parte: 0 | 1) {
  const corte = Math.ceil(lista.length / 2)
  return parte === 0 ? lista.slice(0, corte) : lista.slice(corte)
}

function ColunaAtualizacoes({ registros }: { registros: typeof ATUALIZACOES_VIGMED }) {
  return (
    <div className="vm-atualizacoes-col">
      {registros.map((reg) => (
        <section key={reg.versao} className="vm-atualizacoes-item">
          <h2>
            v{reg.versao}
            <span>{reg.data}</span>
          </h2>
          <ul>
            {reg.itens.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

/** Histórico de versões da plataforma */
export function ListaAtualizacoesAdm() {
  return (
    <SecaoPainel>
      <CabecalhoPagina
        rotulo="Sistema"
        titulo="Atualizações"
        descricao={`Versão atual v${VERSAO_ATUAL}. Histórico de melhorias da plataforma.`}
      />

      <CartaoPainel
        titulo="Histórico"
        descricao="Mudanças recentes disponíveis para a equipe e clientes."
      >
        <div className="vm-atualizacoes-grid">
          <ColunaAtualizacoes registros={metade(ATUALIZACOES_VIGMED, 0)} />
          <ColunaAtualizacoes registros={metade(ATUALIZACOES_VIGMED, 1)} />
        </div>
      </CartaoPainel>
    </SecaoPainel>
  )
}
