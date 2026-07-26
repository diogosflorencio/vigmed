import type { IdTemaVisual } from '@/lib/tema/tipos'
import { obterVariaveisTema } from '@/lib/tema/definicoes'

const PROPS_LEGADAS = [
  '--color-accent-container',
  '--color-surface-tint',
] as const

/** Injeta tokens CSS no elemento raiz (html) */
export function aplicarTokensTema(raiz: HTMLElement, temaVisual: IdTemaVisual, escuro: boolean) {
  const vars = obterVariaveisTema(temaVisual, escuro)

  for (const [prop, valor] of Object.entries(vars)) {
    raiz.style.setProperty(prop, valor)
  }

  for (const prop of PROPS_LEGADAS) {
    raiz.style.removeProperty(prop)
  }
}
