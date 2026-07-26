'use client'

import { useEffect, useRef } from 'react'

/** Uma requisição por visita ao site — evita pausa do Supabase free tier */
export function PingSupabase() {
  const enviado = useRef(false)

  useEffect(() => {
    if (enviado.current) return
    enviado.current = true
    fetch('/api/ping', { method: 'GET', cache: 'no-store' }).catch(() => {})
  }, [])

  return null
}
