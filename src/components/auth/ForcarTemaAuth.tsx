'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { aplicarPreferencias } from '@/lib/tema/aplicar'
import { ehRotaPublica, PREFERENCIAS_TEMA_PUBLICO } from '@/lib/tema/rotas-publicas'

/** Garante tema claro nas telas de entrada e landing */
export function ForcarTemaAuth() {
  const pathname = usePathname()

  useEffect(() => {
    if (!ehRotaPublica(pathname)) return
    aplicarPreferencias(PREFERENCIAS_TEMA_PUBLICO)
  }, [pathname])

  return null
}
