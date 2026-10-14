'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { usePaletaComando } from '@/contexts/PaletaComandoContext'
import { useNotificacoesPortal } from '@/contexts/NotificacoesPortalContext'
import { listarDestinos } from '@/lib/navegacao-menu'
import { hrefPublico, ROTAS } from '@/lib/rotas'
import type { NomeIcone } from '@/lib/icones-animados'
import type { ItemNavegacao } from '@/lib/navegacao'
import { cn } from '@/lib/utils'

interface Props {
  itens: ItemNavegacao[]
  ambiente: 'adm' | 'docs'
}

type ItemPaleta = {
  id: string
  rotulo: string
  icone: NomeIcone
  href: string
  grupo?: string
  externo?: boolean
  secao: 'pendencia' | 'acao' | 'pagina'
}

/** Paleta global Ctrl+K: páginas, pendências e ações rápidas */
export function PaletaComando({ itens, ambiente }: Props) {
  const caminho = usePathname()
  const router = useRouter()
  const { aberta, fechar, alternar } = usePaletaComando()
  const notificacoes = useNotificacoesPortal()
  const [busca, definirBusca] = useState('')
  const [indice, definirIndice] = useState(0)

  const itensPaleta = useMemo(() => {
    const lista: ItemPaleta[] = []

    if (notificacoes.mensagens > 0) {
      lista.push({
        id: 'pend-msg',
        rotulo: `${notificacoes.mensagens} mensagem(ns) não lida(s)`,
        icone: 'message',
        href: hrefPublico(ambiente === 'adm' ? ROTAS.adm.mensagens : ROTAS.docs.mensagens),
        secao: 'pendencia',
      })
    }
    if (ambiente === 'docs' && notificacoes.comunicados > 0) {
      lista.push({
        id: 'pend-com',
        rotulo: `${notificacoes.comunicados} comunicado(s) não lido(s)`,
        icone: 'megaphone',
        href: `${hrefPublico(ROTAS.docs.comunicados)}?filtro=nao-lidos`,
        secao: 'pendencia',
      })
    }
    if (notificacoes.documentosAlerta > 0) {
      lista.push({
        id: 'pend-doc',
        rotulo: `${notificacoes.documentosAlerta} documento(s) a vencer`,
        icone: 'file-text',
        href: hrefPublico(ambiente === 'adm' ? ROTAS.adm.documentos : ROTAS.docs.documentos),
        secao: 'pendencia',
      })
    }
    if (ambiente === 'adm' && notificacoes.convitesPendentes > 0) {
      lista.push({
        id: 'pend-conv',
        rotulo: `${notificacoes.convitesPendentes} convite(s) aguardando aceite`,
        icone: 'user-plus',
        href: hrefPublico(ROTAS.adm.usuarios),
        secao: 'pendencia',
      })
    }
    if (ambiente === 'adm' && notificacoes.retencaoPendente > 0) {
      lista.push({
        id: 'pend-ret',
        rotulo: `${notificacoes.retencaoPendente} doc(s) elegíveis para retenção`,
        icone: 'hard-drive',
        href: hrefPublico(ROTAS.adm.configuracoes),
        secao: 'pendencia',
      })
    }

    if (ambiente === 'adm') {
      lista.push(
        {
          id: 'acao-com',
          rotulo: 'Novo comunicado',
          icone: 'megaphone',
          href: hrefPublico(ROTAS.adm.comunicados),
          secao: 'acao',
        },
        {
          id: 'acao-emp',
          rotulo: 'Nova empresa',
          icone: 'building',
          href: hrefPublico(ROTAS.adm.empresas),
          secao: 'acao',
        },
      )
    }

    for (const d of listarDestinos(itens)) {
      lista.push({
        id: d.id,
        rotulo: d.rotulo,
        icone: d.icone,
        href: d.href,
        grupo: d.grupo,
        externo: d.externo,
        secao: 'pagina',
      })
    }

    return lista
  }, [itens, ambiente, notificacoes])

  const filtrados = itensPaleta.filter((d) => {
    if (!busca.trim()) return true
    const termo = busca.toLowerCase()
    return (
      d.rotulo.toLowerCase().includes(termo) ||
      (d.grupo?.toLowerCase().includes(termo) ?? false)
    )
  })

  const irPara = useCallback(
    (href: string, externo?: boolean) => {
      fechar()
      definirBusca('')
      definirIndice(0)
      if (externo) {
        window.open(href, '_blank')
        return
      }
      router.push(href)
    },
    [fechar, router],
  )

  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        alternar()
        definirBusca('')
        definirIndice(0)
        return
      }
      if (e.key === 'Escape') fechar()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [alternar, fechar])

  useEffect(() => {
    if (!aberta) return
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        definirIndice((i) => Math.min(i + 1, Math.max(filtrados.length - 1, 0)))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        definirIndice((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && filtrados[indice]) {
        e.preventDefault()
        irPara(filtrados[indice].href, filtrados[indice].externo)
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [aberta, filtrados, indice, irPara])

  useEffect(() => {
    definirIndice(0)
  }, [busca])

  useEffect(() => {
    if (!aberta) {
      definirBusca('')
      definirIndice(0)
    }
  }, [aberta])

  let secaoAtual: ItemPaleta['secao'] | null = null

  return (
    <AnimatePresence>
      {aberta && (
        <>
          <motion.div
            className="menu-paleta-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={fechar}
          />
          <motion.div
            className="menu-paleta-modal menu-paleta-painel"
            role="dialog"
            aria-label="Busca do painel"
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.18 }}
          >
            <div className="menu-paleta-busca-wrap">
              <IconeAnimado nome="search" tamanho={16} className="text-(--color-text-3)" />
              <input
                autoFocus
                className="menu-paleta-busca"
                placeholder="Buscar páginas, pendências ou ações..."
                value={busca}
                onChange={(e) => definirBusca(e.target.value)}
              />
              <button type="button" className="menu-paleta-fechar" onClick={fechar}>
                <IconeAnimado nome="x" tamanho={14} />
              </button>
            </div>

            <ul className="menu-paleta-lista">
              {filtrados.map((d, i) => {
                const mostrarSecao = d.secao !== secaoAtual
                if (mostrarSecao) secaoAtual = d.secao
                const rotuloSecao =
                  d.secao === 'pendencia'
                    ? 'Pendências'
                    : d.secao === 'acao'
                      ? 'Ações rápidas'
                      : secaoAtual === 'pagina' && mostrarSecao
                        ? 'Páginas'
                        : null
                return (
                  <li key={d.id}>
                    {mostrarSecao && rotuloSecao && (
                      <p className="menu-paleta-secao">{rotuloSecao}</p>
                    )}
                    <button
                      type="button"
                      className={cn(
                        'menu-paleta-item',
                        i === indice && 'menu-paleta-item--foco',
                        caminho.startsWith(d.href.split('?')[0]) && 'menu-paleta-item--ativo',
                        d.secao === 'pendencia' && 'menu-paleta-item--pendencia',
                      )}
                      onClick={() => irPara(d.href, d.externo)}
                      onMouseEnter={() => definirIndice(i)}
                    >
                      <IconeAnimado nome={d.icone} tamanho={16} />
                      <div className="menu-paleta-item-texto">
                        <span>{d.rotulo}</span>
                        {d.grupo && <small>{d.grupo}</small>}
                      </div>
                      {d.externo && <IconeAnimado nome="external-link" tamanho={12} />}
                    </button>
                  </li>
                )
              })}
              {filtrados.length === 0 && (
                <li className="menu-paleta-vazio">Nenhum resultado para &quot;{busca}&quot;</li>
              )}
            </ul>

            <footer className="menu-paleta-rodape">
              <span>↑↓ navegar</span>
              <span>Enter abrir</span>
              <span>Esc fechar</span>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
