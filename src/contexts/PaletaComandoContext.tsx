'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface PaletaComandoContexto {
  aberta: boolean
  abrir: () => void
  fechar: () => void
  alternar: () => void
}

const Contexto = createContext<PaletaComandoContexto | null>(null)

export function ProvedorPaletaComando({ children }: { children: ReactNode }) {
  const [aberta, definirAberta] = useState(false)

  const abrir = useCallback(() => definirAberta(true), [])
  const fechar = useCallback(() => definirAberta(false), [])
  const alternar = useCallback(() => definirAberta((v) => !v), [])

  const valor = useMemo(
    () => ({ aberta, abrir, fechar, alternar }),
    [aberta, abrir, fechar, alternar],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function usePaletaComando() {
  const ctx = useContext(Contexto)
  if (!ctx) {
    return {
      aberta: false,
      abrir: () => {},
      fechar: () => {},
      alternar: () => {},
    }
  }
  return ctx
}
