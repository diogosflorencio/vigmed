'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import {
  aplicarPreferencias,
  lerPreferenciasLocais,
  preferenciasDoPerfil,
  resolverModoEscuro,
  salvarPreferenciasLocais,
} from '@/lib/tema/aplicar'
import { salvarPreferenciasAparencia } from '@/lib/perfil/preferencias'
import { ehRotaPublica, PREFERENCIAS_TEMA_PUBLICO } from '@/lib/tema/rotas-publicas'
import type { ModoTema, IdTemaVisual, PreferenciasAparencia } from '@/lib/tema/tipos'
import { PREFERENCIAS_PADRAO } from '@/lib/tema/tipos'

export type Tema = 'light' | 'dark'

interface ValorContextoTema {
  /** Tema resolvido (claro ou escuro) */
  tema: Tema
  modo: ModoTema
  temaVisual: IdTemaVisual
  montado: boolean
  alternarTema: () => void
  definirModo: (modo: ModoTema) => void
  definirTemaVisual: (tema: IdTemaVisual) => void
  sincronizarDoPerfil: (metadados: Record<string, unknown> | undefined) => void
}

const ContextoTema = createContext<ValorContextoTema | null>(null)

function modoResolvido(prefs: PreferenciasAparencia): Tema {
  return resolverModoEscuro(prefs.modo) ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [prefs, definirPrefs] = useState<PreferenciasAparencia>(PREFERENCIAS_PADRAO)
  const [montado, definirMontado] = useState(false)

  const aplicar = useCallback((proximas: PreferenciasAparencia, persistir = true) => {
    definirPrefs(proximas)
    aplicarPreferencias(proximas)
    if (persistir && !ehRotaPublica(pathname)) salvarPreferenciasLocais(proximas)
  }, [pathname])

  useEffect(() => {
    if (ehRotaPublica(pathname)) {
      aplicarPreferencias(PREFERENCIAS_TEMA_PUBLICO)
      definirPrefs(PREFERENCIAS_TEMA_PUBLICO)
      definirMontado(true)
      document.documentElement.dataset.temaAnimar = 'true'
      return
    }

    const locais = lerPreferenciasLocais()
    aplicar(locais, false)
    definirMontado(true)
    document.documentElement.dataset.temaAnimar = 'true'
  }, [pathname, aplicar])

  useEffect(() => {
    if (ehRotaPublica(pathname)) return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const aoMudarSistema = () => {
      definirPrefs((atual) => {
        if (atual.modo !== 'system') return atual
        aplicarPreferencias(atual)
        return atual
      })
    }
    media.addEventListener('change', aoMudarSistema)
    return () => media.removeEventListener('change', aoMudarSistema)
  }, [pathname])

  const persistirRemoto = useCallback(async (proximas: PreferenciasAparencia) => {
    if (ehRotaPublica(pathname)) return
    try {
      await salvarPreferenciasAparencia(proximas.modo, proximas.temaVisual)
    } catch {
      /* fora do painel autenticado */
    }
  }, [pathname])

  const alternarTema = useCallback(() => {
    if (ehRotaPublica(pathname)) return
    definirPrefs((anterior) => {
      const escuro = resolverModoEscuro(anterior.modo)
      const proximas: PreferenciasAparencia = {
        ...anterior,
        modo: escuro ? 'light' : 'dark',
      }
      salvarPreferenciasLocais(proximas)
      aplicarPreferencias(proximas)
      void persistirRemoto(proximas)
      return proximas
    })
  }, [pathname, persistirRemoto])

  const definirModo = useCallback(
    (modo: ModoTema) => {
      if (ehRotaPublica(pathname)) return
      definirPrefs((anterior) => {
        const proximas = { ...anterior, modo }
        salvarPreferenciasLocais(proximas)
        aplicarPreferencias(proximas)
        void persistirRemoto(proximas)
        return proximas
      })
    },
    [pathname, persistirRemoto],
  )

  const definirTemaVisual = useCallback(
    (temaVisual: IdTemaVisual) => {
      if (ehRotaPublica(pathname)) return
      definirPrefs((anterior) => {
        const proximas = { ...anterior, temaVisual }
        salvarPreferenciasLocais(proximas)
        aplicarPreferencias(proximas)
        void persistirRemoto(proximas)
        return proximas
      })
    },
    [pathname, persistirRemoto],
  )

  const sincronizarDoPerfil = useCallback(
    (metadados: Record<string, unknown> | undefined) => {
      if (ehRotaPublica(pathname)) return
      const doPerfil = preferenciasDoPerfil(metadados)
      if (!doPerfil) return
      aplicar(doPerfil)
    },
    [pathname, aplicar],
  )

  const prefsExibidas = ehRotaPublica(pathname) ? PREFERENCIAS_TEMA_PUBLICO : prefs

  return (
    <ContextoTema.Provider
      value={{
        tema: modoResolvido(prefsExibidas),
        modo: prefsExibidas.modo,
        temaVisual: prefsExibidas.temaVisual,
        montado,
        alternarTema,
        definirModo,
        definirTemaVisual,
        sincronizarDoPerfil,
      }}
    >
      {children}
    </ContextoTema.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ContextoTema)
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  return ctx
}

export const useTema = useTheme
