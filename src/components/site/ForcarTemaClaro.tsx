'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { aplicarPreferencias } from '@/lib/tema/aplicar'
import { ehRotaPublica, PREFERENCIAS_TEMA_PUBLICO } from '@/lib/tema/rotas-publicas'

/** Mantém landing/blog sempre no tema claro institucional */
export function ForcarTemaClaro() {
  const pathname = usePathname()

  useEffect(() => {
    if (!ehRotaPublica(pathname)) return
    aplicarPreferencias(PREFERENCIAS_TEMA_PUBLICO)
  }, [pathname])

  return null
}
