'use client'

import { cn } from '@/lib/utils'

/** Mockup do portal docs: laptop + celular com UI reconhecível */
export function MockupPainelLanding() {
  return (
    <div className="vig-mockup-dispositivos" aria-hidden>
      <div className="vig-mockup-laptop">
        <div className="vig-mockup-laptop-tela">
          <div className="vig-mockup-laptop-topo">
            <span className="vig-mockup-dot vig-mockup-dot--r" />
            <span className="vig-mockup-dot vig-mockup-dot--y" />
            <span className="vig-mockup-dot vig-mockup-dot--g" />
            <span className="vig-mockup-laptop-url">docs.vigmed.com.br</span>
          </div>
          <div className="vig-mockup-laptop-corpo">
            <aside className="vig-mockup-sidebar">
              {[
                { rotulo: 'Painel', ativo: true },
                { rotulo: 'Laudos', ativo: false },
                { rotulo: 'Colaboradores', ativo: false },
                { rotulo: 'Mensagens', ativo: false },
                { rotulo: 'Meu perfil', ativo: false },
              ].map((item) => (
                <div
                  key={item.rotulo}
                  className={cn('vig-mockup-sidebar-item', item.ativo && 'vig-mockup-sidebar-item--ativo')}
                >
                  <span className="vig-mockup-sidebar-trilha" />
                  <span>{item.rotulo}</span>
                </div>
              ))}
            </aside>
            <main className="vig-mockup-conteudo">
              <div className="vig-mockup-banner">
                <p className="vig-mockup-saudacao">Olá, Empresa Exemplo!</p>
                <p className="vig-mockup-banner-sub">Laudos e documentos dos exames ocupacionais</p>
              </div>
              <div className="vig-mockup-cards">
                {[
                  { r: 'Laudos', v: '128' },
                  { r: 'Colaboradores', v: '86' },
                  { r: 'Exames', v: '142' },
                  { r: 'Último', v: '16/05' },
                ].map((m) => (
                  <div key={m.r} className="vig-mockup-card-mini">
                    <span>{m.r}</span>
                    <strong>{m.v}</strong>
                  </div>
                ))}
              </div>
              <div className="vig-mockup-tabela">
                <div className="vig-mockup-tabela-cab">Laudos recentes</div>
                {[
                  { nome: 'João da Silva', status: 'Disponível' },
                  { nome: 'Maria Souza', status: 'Disponível' },
                  { nome: 'Carlos Lima', status: 'Disponível' },
                ].map((linha) => (
                  <div key={linha.nome} className="vig-mockup-linha vig-mockup-linha--row">
                    <span>{linha.nome}</span>
                    <em className="vig-mockup-selo">{linha.status}</em>
                  </div>
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
          <p className="vig-mockup-saudacao vig-mockup-saudacao--mobile">Documentos</p>
          {['ASO admissional', 'Laudo ergonômico', 'PCMSO 2026', 'Comunicado NR-35'].map((nome) => (
            <div key={nome} className="vig-mockup-linha vig-mockup-linha--row vig-mockup-linha--mobile">
              <span>{nome}</span>
            </div>
          ))}
          <div className="vig-mockup-dock-mobile">
            {['Início', 'Docs', 'Msgs'].map((item, i) => (
              <span key={item} className={cn(i === 1 && 'vig-mockup-dock-mobile--ativo')}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
