/** Claro, escuro ou seguir o sistema */
export type ModoTema = 'light' | 'dark' | 'system'

/** Temas visuais do painel (nomes de frutas) */
export type IdTemaVisual = 'banana' | 'limao' | 'mirtilo' | 'acai'

export interface PreferenciasAparencia {
  modo: ModoTema
  temaVisual: IdTemaVisual
}

export const PREFERENCIAS_PADRAO: PreferenciasAparencia = {
  modo: 'system',
  temaVisual: 'banana',
}

/** Migra ids antigos (paletas, nomes anteriores) */
export function normalizarIdTemaVisual(valor: string | undefined | null): IdTemaVisual {
  const mapaLegado: Record<string, IdTemaVisual> = {
    banana: 'banana',
    limao: 'limao',
    limão: 'limao',
    mirtilo: 'mirtilo',
    acai: 'acai',
    açaí: 'acai',
    uva: 'acai',
    figo: 'banana',
    kiwi: 'limao',
    ardosia: 'banana',
    neutro: 'banana',
    vigmed: 'mirtilo',
    azul: 'mirtilo',
    floresta: 'limao',
    verde: 'limao',
    oceano: 'acai',
    violeta: 'acai',
  }
  if (valor && valor in mapaLegado) return mapaLegado[valor]
  return PREFERENCIAS_PADRAO.temaVisual
}
