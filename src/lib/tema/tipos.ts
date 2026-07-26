/** Claro, escuro ou seguir o sistema */
export type ModoTema = 'light' | 'dark' | 'system'

/** Temas visuais do painel */
export type IdTemaVisual = 'banana' | 'limao' | 'azulao' | 'acai'

export const TEMAS_VISUAIS_VALIDOS: IdTemaVisual[] = ['banana', 'limao', 'azulao', 'acai']

export interface PreferenciasAparencia {
  modo: ModoTema
  temaVisual: IdTemaVisual
}

export const PREFERENCIAS_PADRAO: PreferenciasAparencia = {
  modo: 'system',
  temaVisual: 'banana',
}

export function normalizarIdTemaVisual(valor: string | undefined | null): IdTemaVisual {
  if (valor && TEMAS_VISUAIS_VALIDOS.includes(valor as IdTemaVisual)) {
    return valor as IdTemaVisual
  }
  return PREFERENCIAS_PADRAO.temaVisual
}
