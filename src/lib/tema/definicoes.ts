import type { IdTemaVisual } from '@/lib/tema/tipos'

/** Tokens CSS aplicados em `document.documentElement` */
export type VariaveisTema = Record<string, string>

export interface MetaTemaVisual {
  id: IdTemaVisual
  rotulo: string
  descricao: string
  /** Preview: [fundo, primária, superfície] */
  preview: [string, string, string]
}

interface ParModos {
  light: VariaveisTema
  dark: VariaveisTema
}

/** Superfícies neutras; cor fica no acento, não no fundo inteiro */
const SUP_CLARO: [string, string, string] = ['#ffffff', '#f6f6f6', '#ebebeb']
const TXT_CLARO: [string, string, string] = ['#111111', '#484848', '#767676']
const BDR_CLARO: [string, string] = ['#e2e2e2', '#9a9a9a']

const SUP_ESCURO: [string, string, string] = ['#1c1c1c', '#121212', '#282828']
const TXT_ESCURO: [string, string, string] = ['#f5f5f5', '#b8b8b8', '#848484']
const BDR_ESCURO: [string, string] = ['#383838', '#5c5c5c']

function montarTokens(
  accent: string,
  accentFg: string,
  superficies: [string, string, string],
  texto: [string, string, string],
  bordas: [string, string],
  escuro: boolean,
  extras?: Partial<VariaveisTema>,
): VariaveisTema {
  const [s1, s2, s3] = superficies
  const [t1, t2, t3] = texto
  const [b1, b2] = bordas

  return {
    '--color-surface': s1,
    '--color-surface-2': s2,
    '--color-surface-3': s3,
    '--color-border': b1,
    '--color-border-strong': b2,
    '--color-text-1': t1,
    '--color-text-2': t2,
    '--color-text-3': t3,
    '--color-accent': accent,
    '--color-accent-fg': accentFg,
    '--color-danger': escuro ? '#f87171' : '#b42318',
    '--color-danger-bg': escuro ? '#2a1515' : '#fff5f4',
    '--color-success': escuro ? '#4ade80' : '#15803d',
    '--color-success-bg': escuro ? '#142818' : '#ecfdf3',
    '--color-warning': escuro ? '#fbbf24' : '#b45309',
    '--color-warning-bg': escuro ? '#2a2010' : '#fffbeb',
    '--color-info': accent,
    '--color-info-bg': escuro ? s3 : s2,
    '--vidro-superficie': escuro ? 'rgba(28, 28, 28, 0.72)' : 'rgba(255, 255, 255, 0.72)',
    '--vidro-superficie-2': escuro ? 'rgba(18, 18, 18, 0.55)' : 'rgba(246, 246, 246, 0.55)',
    '--vidro-superficie-forte': escuro ? 'rgba(40, 40, 40, 0.88)' : 'rgba(255, 255, 255, 0.9)',
    '--vidro-borda': escuro ? 'rgba(255, 255, 255, 0.1)' : 'rgba(17, 17, 17, 0.1)',
    '--vidro-blur': escuro ? '18px' : '16px',
    '--glass-bg': escuro ? 'rgba(28, 28, 28, 0.75)' : 'rgba(255, 255, 255, 0.78)',
    '--glass-border': escuro ? 'rgba(255, 255, 255, 0.1)' : 'rgba(17, 17, 17, 0.1)',
    '--glass-border-shine': escuro ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.9)',
    '--glass-button-bg': escuro ? 'rgba(40, 40, 40, 0.9)' : 'rgba(255, 255, 255, 0.92)',
    '--glass-button-border': escuro ? 'rgba(255, 255, 255, 0.12)' : 'rgba(17, 17, 17, 0.12)',
    '--glass-nav-active': `color-mix(in srgb, ${accent} ${escuro ? '22%' : '16%'}, transparent)`,
    '--glass-nav-hover': escuro ? 'rgba(255, 255, 255, 0.07)' : 'rgba(17, 17, 17, 0.06)',
    '--menu-dock-hover': `color-mix(in srgb, ${accent} ${escuro ? '16%' : '11%'}, transparent)`,
    '--selection-bg': `color-mix(in srgb, ${accent} ${escuro ? '30%' : '20%'}, transparent)`,
    '--background': s2,
    '--foreground': t1,
    '--card': s1,
    '--card-foreground': t1,
    '--popover': s1,
    '--popover-foreground': t1,
    '--primary': accent,
    '--primary-foreground': accentFg,
    '--secondary': s3,
    '--secondary-foreground': t1,
    '--muted': s3,
    '--muted-foreground': t3,
    '--accent': s3,
    '--accent-foreground': t1,
    '--destructive': escuro ? 'oklch(0.704 0.191 22.216)' : 'oklch(0.577 0.245 27.325)',
    '--border': b1,
    '--input': b1,
    '--ring': `color-mix(in srgb, ${accent} 60%, ${b2})`,
    '--radius': '0.375rem',
    ...extras,
  }
}

function temaVivo(accentClaro: string, accentFgClaro: string, accentEscuro: string, accentFgEscuro: string) {
  return {
    light: montarTokens(accentClaro, accentFgClaro, SUP_CLARO, TXT_CLARO, BDR_CLARO, false),
    dark: montarTokens(accentEscuro, accentFgEscuro, SUP_ESCURO, TXT_ESCURO, BDR_ESCURO, true),
  }
}

/** Registro central; adicione frutas aqui */
export const REGISTRO_TEMAS: readonly (MetaTemaVisual & { modos: ParModos })[] = [
  {
    id: 'banana',
    rotulo: 'Banana',
    descricao: 'Neutro escuro com acento banana madura. Alto contraste.',
    preview: ['#f8f8f7', '#2e3038', '#ececea'],
    modos: {
      light: montarTokens(
        '#2e3038',
        '#faf8ff',
        ['#f8f8f7', '#f0f0ee', '#ececea'],
        ['#1c1c1a', '#5c5c58', '#8a8a85'],
        ['#d4d4d0', '#8a8a85'],
        false,
      ),
      dark: montarTokens(
        '#e2e2ec',
        '#191b22',
        ['#2e3038', '#1c1c1a', '#3a3a38'],
        ['#f5f5f4', '#a8a8a3', '#6b6b67'],
        ['#4a4a48', '#6b6b67'],
        true,
      ),
    },
  },
  {
    id: 'mirtilo',
    rotulo: 'Mirtilo',
    descricao: 'Azul intenso em fundo neutro. Corporativo e direto.',
    preview: ['#ffffff', '#0038a8', '#f0f0f0'],
    modos: temaVivo('#0038a8', '#ffffff', '#5b9aff', '#0a1020'),
  },
  {
    id: 'limao',
    rotulo: 'Limão',
    descricao: 'Verde saturado nos acentos, fundo neutro.',
    preview: ['#ffffff', '#0a7a52', '#f0f0f0'],
    modos: temaVivo('#0a7a52', '#ffffff', '#2dd4a0', '#042818'),
  },
  {
    id: 'acai',
    rotulo: 'Açaí',
    descricao: 'Roxo profundo com punch. Fundo neutro, botões marcantes.',
    preview: ['#ffffff', '#5b21b6', '#f0f0f0'],
    modos: temaVivo('#5b21b6', '#ffffff', '#c4b5fd', '#1a0a38'),
  },
] as const

const mapaTema = Object.fromEntries(REGISTRO_TEMAS.map((t) => [t.id, t])) as Record<
  IdTemaVisual,
  (typeof REGISTRO_TEMAS)[number]
>

export function obterDefinicaoTema(id: IdTemaVisual) {
  return mapaTema[id] ?? mapaTema.banana
}

export function obterVariaveisTema(id: IdTemaVisual, escuro: boolean): VariaveisTema {
  const def = obterDefinicaoTema(id)
  return escuro ? def.modos.dark : def.modos.light
}

/** Mapa serializado para o script inline no `<head>` */
export function obterMapaVariaveisInline(): Record<IdTemaVisual, { light: VariaveisTema; dark: VariaveisTema }> {
  return Object.fromEntries(
    REGISTRO_TEMAS.map((t) => [t.id, t.modos]),
  ) as Record<IdTemaVisual, { light: VariaveisTema; dark: VariaveisTema }>
}
