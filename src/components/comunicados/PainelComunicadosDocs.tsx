'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Pin } from 'lucide-react'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { Button } from '@/components/ui'
import { marcarComunicadoLido } from '@/lib/comunicados/acoes'
import { cn, formatarDataHora } from '@/lib/utils'
import type { Comunicado } from '@/types'

interface Props {
  comunicados: Comunicado[]
}

export function PainelComunicadosDocs({ comunicados }: Props) {
  const router = useRouter()
  const [, iniciarTransicao] = useTransition()

  function marcarLido(id: string) {
    iniciarTransicao(async () => {
      await marcarComunicadoLido(id)
      router.refresh()
    })
  }

  return (
    <SecaoPainel>
      <CabecalhoPagina
        titulo="Comunicados"
        descricao="Avisos e atualizações publicados pela administração VIGMED."
      />

      <div className="flex flex-col gap-3">
        {comunicados.map((c, i) => (
          <RevelarScroll key={c.id} atraso={i * 0.04}>
            <div className={cn('comunicado-card', c.fixado && 'comunicado-card--fixado')}>
              {c.fixado && (
                <div className="comunicado-card-barra">
                  <span className="flex items-center gap-1.5"><Pin size={11} /> Fixado</span>
                </div>
              )}
              <div className="comunicado-card-corpo">
                <div className="flex justify-between items-start gap-2">
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-1)' }}>{c.titulo}</h3>
                  <span className={cn('badge-prioridade', `prioridade-${c.prioridade}`)}>{c.prioridade}</span>
                </div>
                <span className="tabela-mono">{formatarDataHora(c.publicado_em)}</span>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-2)', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>
                  {c.corpo}
                </p>
                <div style={{ paddingTop: '0.45rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="ghost" size="sm" onClick={() => marcarLido(c.id)}>
                    <Eye size={13} />
                    Marcar como lido
                  </Button>
                </div>
              </div>
            </div>
          </RevelarScroll>
        ))}

        {comunicados.length === 0 && (
          <RevelarScroll>
            <div className="painel-vazio painel-card">
              <IconeAnimado nome="megaphone" tamanho={24} className="opacity-40" />
              Nenhum comunicado no momento.
            </div>
          </RevelarScroll>
        )}
      </div>
    </SecaoPainel>
  )
}
