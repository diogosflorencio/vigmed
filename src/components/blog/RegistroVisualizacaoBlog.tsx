'use client'

import { useEffect } from 'react'

/** Registra visualização do post uma vez por sessão de página */
export function RegistroVisualizacaoBlog({ postId }: { postId: string }) {
  useEffect(() => {
    const chave = `vigmed-blog-view-${postId}`
    if (sessionStorage.getItem(chave)) return
    sessionStorage.setItem(chave, '1')

    void fetch('/api/blog/visualizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }),
    })
  }, [postId])

  return null
}
