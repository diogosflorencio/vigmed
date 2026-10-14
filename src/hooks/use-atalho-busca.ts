'use client'

import { useEffect, type RefObject } from 'react'

function resolverInput(refOrId: RefObject<HTMLInputElement | null> | string): HTMLInputElement | null {
  if (typeof refOrId === 'string') {
    return document.getElementById(refOrId) as HTMLInputElement | null
  }
  return refOrId.current
}

/** Foca o campo de busca ao pressionar / (fora de inputs) */
export function useAtalhoBusca(refOrId: RefObject<HTMLInputElement | null> | string, ativo = true) {
  useEffect(() => {
    if (!ativo) return
    function aoTeclar(e: KeyboardEvent) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      e.preventDefault()
      resolverInput(refOrId)?.focus()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [refOrId, ativo])
}
