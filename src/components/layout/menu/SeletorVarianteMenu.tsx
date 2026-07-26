'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { OPCOES_VARIANTE_MENU, type VarianteMenu } from '@/contexts/MenuVarianteContext'
import { cn } from '@/lib/utils'

interface Props {
  valor: VarianteMenu
  onChange: (v: VarianteMenu) => void
}

/** Seletor flutuante para comparar as 5 variantes de menu */
export function SeletorVarianteMenu({ valor, onChange }: Props) {
  const [aberto, definirAberto] = useState(false)

  const atual = OPCOES_VARIANTE_MENU.find((o) => o.id === valor)

  return (
    <div className="seletor-menu-variante">
      <button
        type="button"
        className="seletor-menu-variante-btn"
        onClick={() => definirAberto((v) => !v)}
        aria-expanded={aberto}
      >
        <span className="seletor-menu-variante-badge">5 menus</span>
        <span className="seletor-menu-variante-atual">{atual?.rotulo ?? 'Menu'}</span>
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            className="seletor-menu-variante-painel"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <p className="seletor-menu-variante-titulo">Escolha o estilo do menu</p>
            <p className="seletor-menu-variante-sub">Todas levam aos mesmos links. Sua escolha fica salva no navegador.</p>

            <ul className="seletor-menu-variante-lista">
              {OPCOES_VARIANTE_MENU.map((opcao) => (
                <li key={opcao.id}>
                  <button
                    type="button"
                    className={cn('seletor-menu-variante-opcao', valor === opcao.id && 'seletor-menu-variante-opcao--ativa')}
                    onClick={() => {
                      onChange(opcao.id)
                      definirAberto(false)
                    }}
                  >
                    <span className="seletor-menu-variante-opcao-titulo">{opcao.rotulo}</span>
                    <span className="seletor-menu-variante-opcao-desc">{opcao.descricao}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
