'use client'

import { cn } from '@/lib/utils'

/** Mockup visual do painel, laptop + celular para a landing */
export function MockupPainelLanding() {
  return (
    <div className="vig-mockup-dispositivos" aria-hidden>
      <div className="vig-mockup-laptop">
        <div className="vig-mockup-laptop-tela">
          <div className="vig-mockup-laptop-topo">
            <span className="vig-mockup-dot vig-mockup-dot--r" />
            <span className="vig-mockup-dot vig-mockup-dot--y" />
            <span className="vig-mockup-dot vig-mockup-dot--g" />
          </div>
          <div className="vig-mockup-laptop-corpo">
            <aside className="vig-mockup-sidebar">
              {['Painel', 'Laudos', 'Docs', 'Msgs'].map((item, i) => (
                <div key={item} className={cn('vig-mockup-sidebar-item', i === 0 && 'vig-mockup-sidebar-item--ativo')}>
                  <span className="vig-mockup-sidebar-ico" />
                  <span>{item}</span>
                </div>
              ))}
            </aside>
            <main className="vig-mockup-conteudo">
              <div className="vig-mockup-linha vig-mockup-linha--titulo" />
              <div className="vig-mockup-cards">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="vig-mockup-card-mini" />
                ))}
              </div>
              <div className="vig-mockup-tabela">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="vig-mockup-linha vig-mockup-linha--row" />
                ))}
              </div>
            </main>
          </div>
        </div>
        <div className="vig-mockup-laptop-base" />
      </div>

      <div className="vig-mockup-celular">
        <div className="vig-mockup-celular-notch" />
        <div className="vig-mockup-celular-tela">
          <div className="vig-mockup-linha vig-mockup-linha--titulo" />
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="vig-mockup-linha vig-mockup-linha--row" />
          ))}
        </div>
      </div>
    </div>
  )
}
