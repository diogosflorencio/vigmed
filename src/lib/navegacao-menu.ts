import type { NomeIcone } from '@/lib/icones-animados'
import type { ItemNavegacao } from '@/lib/navegacao'
import { itemEstaAtivo } from '@/lib/navegacao'

/** Destino clicável (link direto ou filho de grupo) */
export interface DestinoNavegacao {
  id: string
  rotulo: string
  icone: NomeIcone
  href: string
  grupo?: string
  grupoId?: string
  externo?: boolean
}

/** Lista plana de todos os destinos para paleta, dock e busca */
export function listarDestinos(itens: ItemNavegacao[]): DestinoNavegacao[] {
  const destinos: DestinoNavegacao[] = []

  for (const item of itens) {
    if (item.tipo === 'link') {
      destinos.push({
        id: item.id,
        rotulo: item.rotulo,
        icone: item.icone,
        href: item.href,
        externo: item.href.startsWith('http'),
      })
      continue
    }

    for (const filho of item.filhos) {
      destinos.push({
        id: `${item.id}-${filho.href}`,
        rotulo: filho.rotulo,
        icone: filho.icone ?? item.icone,
        href: filho.href,
        grupo: item.rotulo,
        grupoId: item.id,
      })
    }
  }

  return destinos
}

/** Primeiro destino ativo dentro de um item (para destacar grupo) */
export function hrefAtivoDoItem(caminho: string, item: ItemNavegacao): string | null {
  if (item.tipo === 'link') return caminho.startsWith(item.href) ? item.href : null
  const filho = item.filhos.find((f) => caminho.startsWith(f.href))
  return filho?.href ?? null
}

/** Rótulo da página atual */
export function rotuloPaginaAtual(caminho: string, itens: ItemNavegacao[]): string {
  for (const item of itens) {
    if (item.tipo === 'link' && caminho.startsWith(item.href)) return item.rotulo
    if (item.tipo === 'grupo') {
      const filho = item.filhos.find((f) => caminho.startsWith(f.href))
      if (filho) return filho.rotulo
      if (itemEstaAtivo(caminho, item)) return item.rotulo
    }
  }
  return 'Painel'
}

/** Área (grupo ou link isolado) para navegação contextual */
export interface AreaNavegacao {
  id: string
  rotulo: string
  icone: NomeIcone
  tipo: 'link' | 'grupo'
  href?: string
  filhos?: { href: string; rotulo: string; icone?: NomeIcone }[]
}

export function listarAreas(itens: ItemNavegacao[]): AreaNavegacao[] {
  return itens.map((item) => {
    if (item.tipo === 'link') {
      return { id: item.id, rotulo: item.rotulo, icone: item.icone, tipo: 'link', href: item.href }
    }
    return { id: item.id, rotulo: item.rotulo, icone: item.icone, tipo: 'grupo', filhos: item.filhos }
  })
}

/** Área ativa com base no caminho */
export function areaAtiva(caminho: string, areas: AreaNavegacao[]): string {
  for (const area of areas) {
    if (area.tipo === 'link' && area.href && caminho.startsWith(area.href)) return area.id
    if (area.tipo === 'grupo' && area.filhos?.some((f) => caminho.startsWith(f.href))) return area.id
  }
  return areas[0]?.id ?? ''
}
