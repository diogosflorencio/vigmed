'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { hrefPublico, ROTAS } from '@/lib/rotas'
import type { AmbienteApp } from '@/lib/ambiente'

/** Prefetch das rotas principais para a navegação parecer “já pronta”. */
export function PrefetchPainel({ ambiente }: { ambiente: AmbienteApp }) {
  const router = useRouter()

  useEffect(() => {
    const rotas =
      ambiente === 'adm'
        ? [
            ROTAS.adm.painel,
            ROTAS.adm.empresas,
            ROTAS.adm.documentos,
            ROTAS.adm.usuarios,
            ROTAS.adm.mensagens,
            ROTAS.adm.comunicados,
            ROTAS.adm.relatorios,
            ROTAS.adm.auditoria,
            ROTAS.adm.configuracoes,
            ROTAS.adm.perfil,
          ]
        : [
            ROTAS.docs.painel,
            ROTAS.docs.documentos,
            ROTAS.docs.mensagens,
            ROTAS.docs.comunicados,
            ROTAS.docs.usuarios,
            ROTAS.docs.perfil,
          ]

    for (const rota of rotas) {
      try {
        router.prefetch(hrefPublico(rota))
      } catch {
        /* prefetch best-effort */
      }
    }
  }, [ambiente, router])

  return null
}
