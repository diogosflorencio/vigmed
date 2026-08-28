import type { ModoTema, PreferenciasAparencia } from '@/lib/tema/tipos'
import { PREFERENCIAS_PADRAO, normalizarIdTemaVisual, normalizarModeloMenu } from '@/lib/tema/tipos'
import { aplicarTokensTema } from '@/lib/tema/aplicar-tokens'

const CHAVE_MODO = 'vigmed-theme'
const CHAVE_TEMA_VISUAL = 'vigmed-tema-visual'
const CHAVE_MODELO_MENU = 'vigmed-modelo-menu'

export function resolverModoEscuro(modo: ModoTema): boolean {
  if (modo === 'dark') return true
  if (modo === 'light') return false
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** Aplica modo claro/escuro + tema visual completo (via data-* no html) */
export function aplicarPreferencias({ modo, temaVisual, modeloMenu }: PreferenciasAparencia) {
  if (typeof document === 'undefined') return

  const escuro = resolverModoEscuro(modo)
  const raiz = document.documentElement

  raiz.dataset.theme = escuro ? 'dark' : 'light'
  raiz.dataset.tema = temaVisual
  raiz.dataset.modeloMenu = modeloMenu
  raiz.classList.toggle('dark', escuro)

  aplicarTokensTema(raiz, temaVisual, escuro)
}

export function lerPreferenciasLocais(): PreferenciasAparencia {
  if (typeof window === 'undefined') return PREFERENCIAS_PADRAO

  const modoSalvo = localStorage.getItem(CHAVE_MODO) as ModoTema | null
  const temaSalvo = localStorage.getItem(CHAVE_TEMA_VISUAL)
  const menuSalvo = localStorage.getItem(CHAVE_MODELO_MENU)

  return {
    modo: modoSalvo === 'light' || modoSalvo === 'dark' || modoSalvo === 'system' ? modoSalvo : PREFERENCIAS_PADRAO.modo,
    temaVisual: normalizarIdTemaVisual(temaSalvo),
    modeloMenu: normalizarModeloMenu(menuSalvo),
  }
}

export function salvarPreferenciasLocais(prefs: PreferenciasAparencia) {
  localStorage.setItem(CHAVE_MODO, prefs.modo)
  localStorage.setItem(CHAVE_TEMA_VISUAL, prefs.temaVisual)
  localStorage.setItem(CHAVE_MODELO_MENU, prefs.modeloMenu)
  aplicarPreferencias(prefs)
}

export function preferenciasDoPerfil(metadados: Record<string, unknown> | undefined): PreferenciasAparencia | null {
  if (!metadados?.aparencia || typeof metadados.aparencia !== 'object') return null
  const a = metadados.aparencia as Record<string, unknown>
  const modo = a.modo as ModoTema | undefined
  const temaRaw = a.temaVisual as string | undefined
  const menuRaw = a.modeloMenu as string | undefined
  if (!modo && !temaRaw && !menuRaw) return null
  return {
    modo: modo === 'light' || modo === 'dark' || modo === 'system' ? modo : PREFERENCIAS_PADRAO.modo,
    temaVisual: normalizarIdTemaVisual(temaRaw),
    modeloMenu: normalizarModeloMenu(menuRaw),
  }
}
