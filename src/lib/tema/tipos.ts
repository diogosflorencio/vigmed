/** Claro, escuro ou seguir o sistema */
export type ModoTema = 'light' | 'dark' | 'system'

/** Temas visuais do painel */
export type IdTemaVisual = 'vigmed' | 'banana' | 'limao' | 'azulao' | 'acai'

export const TEMAS_VISUAIS_VALIDOS: IdTemaVisual[] = ['vigmed', 'banana', 'limao', 'azulao', 'acai']

/** Layout da navegação do painel */
export type ModeloMenu = 'dock' | 'lateral' | 'direita' | 'superior'

export const MODELOS_MENU_VALIDOS: ModeloMenu[] = ['dock', 'lateral', 'direita', 'superior']

export interface PreferenciasAparencia {
  modo: ModoTema
  temaVisual: IdTemaVisual
  modeloMenu: ModeloMenu
}

export const PREFERENCIAS_PADRAO: PreferenciasAparencia = {
  modo: 'system',
  temaVisual: 'vigmed',
  modeloMenu: 'lateral',
}

export function normalizarIdTemaVisual(valor: string | undefined | null): IdTemaVisual {
  if (valor && TEMAS_VISUAIS_VALIDOS.includes(valor as IdTemaVisual)) {
    return valor as IdTemaVisual
  }
  return PREFERENCIAS_PADRAO.temaVisual
}

export function normalizarModeloMenu(valor: string | undefined | null): ModeloMenu {
  if (valor && MODELOS_MENU_VALIDOS.includes(valor as ModeloMenu)) {
    return valor as ModeloMenu
  }
  return PREFERENCIAS_PADRAO.modeloMenu
}
