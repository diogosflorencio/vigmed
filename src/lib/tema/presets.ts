import type { IdTemaVisual } from '@/lib/tema/tipos'
import { REGISTRO_TEMAS, obterDefinicaoTema } from '@/lib/tema/definicoes'

export type { MetaTemaVisual } from '@/lib/tema/definicoes'

export interface TemaVisualMeta {
  id: IdTemaVisual
  rotulo: string
  descricao: string
  preview: [string, string, string]
}

/** Metadados dos temas — derivados do registro central */
export const TEMAS_VISUAIS: TemaVisualMeta[] = REGISTRO_TEMAS.map(({ id, rotulo, descricao, preview }) => ({
  id,
  rotulo,
  descricao,
  preview,
}))

export function obterTemaVisual(id: IdTemaVisual) {
  const def = obterDefinicaoTema(id)
  return { id: def.id, rotulo: def.rotulo, descricao: def.descricao, preview: def.preview }
}

/** @deprecated Use TEMAS_VISUAIS */
export const PALETAS = TEMAS_VISUAIS
export const obterPaleta = obterTemaVisual
