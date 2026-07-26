const BLOCOS_NIVEL = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'] as const
const LARGURA_ROTULO_PADRAO = 18

export interface ItemGrafico {
  nome: string
  valor: number
}

function truncarRotulo(texto: string, largura = LARGURA_ROTULO_PADRAO): string {
  if (texto.length <= largura) return texto.padEnd(largura, ' ')
  return `${texto.slice(0, largura - 1)}…`
}

/** Barra horizontal com rótulo, preenchimento e valor */
export function barraHorizontal(item: ItemGrafico, maximo: number, largura = 24): string {
  const preenchido = maximo > 0 ? Math.round((item.valor / maximo) * largura) : 0
  const barra = '█'.repeat(Math.min(preenchido, largura)) + '░'.repeat(Math.max(0, largura - preenchido))
  const rotulo = truncarRotulo(item.nome)
  const num = String(item.valor).padStart(6, ' ')
  return `${rotulo} ${barra} ${num}`
}

/** Várias barras empilhadas em bloco de texto */
export function blocoBarras(itens: ItemGrafico[], largura = 28): string {
  const maximo = Math.max(...itens.map((i) => i.valor), 1)
  return itens.map((item) => barraHorizontal(item, maximo, largura)).join('\n')
}

/** Sparkline com blocos unicode ▁▂▃... */
export function sparkline(itens: ItemGrafico[]): string {
  const maximo = Math.max(...itens.map((i) => i.valor), 1)
  return itens
    .map((item) => {
      const idx =
        item.valor <= 0
          ? 0
          : Math.min(BLOCOS_NIVEL.length - 1, Math.round((item.valor / maximo) * (BLOCOS_NIVEL.length - 1)))
      return BLOCOS_NIVEL[idx]
    })
    .join('')
}

/** Linha sparkline com rótulos abaixo */
export function blocoSparkline(itens: ItemGrafico[]): string {
  const linha = sparkline(itens)
  const rotulos = itens.map((i) => i.nome.slice(0, 3).padEnd(4)).join('')
  const valores = itens.map((i) => String(i.valor).padStart(4)).join('')
  return `${linha}\n${rotulos}\n${valores}`
}

/** Barra única de progresso em caracteres */
export function barraProgresso(pct: number, largura = 36): string {
  const preenchido = Math.round((Math.min(Math.max(pct, 0), 100) / 100) * largura)
  return `[${'█'.repeat(preenchido)}${'·'.repeat(Math.max(0, largura - preenchido))}] ${pct}%`
}

/** Gráfico de blocos verticais simples (colunas ASCII) */
export function colunasAscii(itens: ItemGrafico[], altura = 6): string {
  const maximo = Math.max(...itens.map((i) => i.valor), 1)
  const linhas: string[] = []

  for (let nivel = altura; nivel >= 1; nivel--) {
    const linha = itens
      .map((item) => {
        const h = Math.round((item.valor / maximo) * altura)
        return h >= nivel ? ' ██ ' : '    '
      })
      .join('')
    linhas.push(linha)
  }

  const base = itens.map((i) => i.nome.slice(0, 4).padEnd(4)).join('    ')
  return [...linhas, '-'.repeat(itens.length * 5), base].join('\n')
}
