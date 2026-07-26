'use client'

import { useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import type { Perfil } from '@/types'

/** Sincroniza preferências de aparência do perfil ao entrar no painel */
export function SincronizarAparencia({ perfil }: { perfil: Perfil }) {
  const { sincronizarDoPerfil } = useTheme()

  useEffect(() => {
    sincronizarDoPerfil(perfil.metadados)
  }, [perfil.metadados, sincronizarDoPerfil])

  return null
}
