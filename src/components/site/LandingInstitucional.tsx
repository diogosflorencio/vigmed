'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Brain,
  Buildings,
  ChartLineUp,
  CheckCircle,
  ClipboardText,
  EnvelopeSimple,
  FileText,
  FirstAidKit,
  HardHat,
  Headphones,
  Heartbeat,
  List,
  LockKey,
  ShieldCheck,
  Stethoscope,
  UsersThree,
  WhatsappLogo,
  ChatCircleDots,
  X,
} from '@phosphor-icons/react'
import { CorteDiagonal } from '@/components/site/landing/CorteDiagonal'
import { FaqAnimado } from '@/components/site/landing/FaqAnimado'
import { ScrollSuave } from '@/components/site/landing/ScrollSuave'
import { ServicosTrilha } from '@/components/site/landing/ServicosTrilha'
import { TeiaConexoes } from '@/components/site/landing/TeiaConexoes'
import { ToggleTemaLanding } from '@/components/site/landing/ToggleTemaLanding'
import { hrefPublico, ROTAS } from '@/lib/rotas'
import { cn } from '@/lib/utils'

const CHAVE_TEMA = 'vigmed-landing-tema'

const NAV = [
  { href: '#inicio', rotulo: 'Início' },
  { href: '#servicos', rotulo: 'Serviços' },
  { href: '#empresas', rotulo: 'Empresas' },
  { href: '#diferenciais', rotulo: 'VIGMED' },
  { href: '#contato', rotulo: 'Contato' },
] as const

const SERVICOS = [
  {
    titulo: 'PCMSO',
    tag: 'Programa',
    descricao: 'Gestão completa do programa, exames periódicos e laudos digitais no portal.',
    icone: HardHat,
  },
  {
    titulo: 'PGR',
    tag: 'Riscos',
    descricao: 'Gerenciamento de riscos alinhado às normas regulamentadoras vigentes.',
    icone: ShieldCheck,
  },
  {
    titulo: 'Medicina do Trabalho',
    tag: 'Clínica',
    descricao: 'Admissionais, periódicos e demissionais com entrega rastreável por empresa.',
    icone: Stethoscope,
  },
  {
    titulo: 'Exames',
    tag: 'Laudos',
    descricao: 'Complementares e clínicos com histórico organizado por colaborador.',
    icone: ClipboardText,
  },
  {
    titulo: 'Psicologia',
    tag: 'Saúde',
    descricao: 'Avaliações e acompanhamento ocupacional com registro centralizado.',
    icone: Brain,
  },
  {
    titulo: 'Documentos',
    tag: 'Portal',
    descricao: 'ASOs e arquivos por CNPJ, com auditoria de quem acessou ou baixou.',
    icone: FileText,
  },
  {
    titulo: 'Comunicados',
    tag: 'Canal',
    descricao: 'Avisos oficiais com confirmação de leitura para toda a equipe.',
    icone: ChatCircleDots,
  },
  {
    titulo: 'eSocial',
    tag: 'Conformidade',
    descricao: 'Apoio à conformidade e eventos de saúde e segurança do trabalho.',
    icone: ChartLineUp,
  },
]

const DIFERENCIAIS = [
  {
    titulo: 'Conformidade viva',
    texto: 'PCMSO, exames e laudos com histórico rastreável, sem pasta perdida.',
    icone: ShieldCheck,
  },
  {
    titulo: 'Equipe na operação',
    texto: 'Médicos, enfermeiros e técnicos no dia a dia, não só no papel.',
    icone: UsersThree,
  },
  {
    titulo: 'Cuidado humano',
    texto: 'Atendimento próximo a colaboradores e suporte real às empresas.',
    icone: Heartbeat,
  },
  {
    titulo: 'Portal por CNPJ',
    texto: 'Cada cliente acessa só o que é dele, no computador ou no celular.',
    icone: ChartLineUp,
  },
]

const FAQ = [
  {
    pergunta: 'Como minha empresa acessa laudos e documentos?',
    resposta:
      'Após convite da administração, ative sua conta e entre no portal. Cada empresa vê apenas os arquivos destinados ao seu CNPJ.',
  },
  {
    pergunta: 'Os exames ocupacionais ficam registrados?',
    resposta:
      'Sim. Laudos, ASOs e documentos complementares ficam arquivados digitalmente com histórico de acesso e download.',
  },
  {
    pergunta: 'Como funcionam os comunicados?',
    resposta:
      'A administração publica avisos no portal. A empresa confirma a leitura e o registro fica disponível para auditoria.',
  },
  {
    pergunta: 'Posso escolher como navegar no painel?',
    resposta:
      'Sim. Em Meu perfil, na seção Aparência, você escolhe dock inferior, barra lateral ou menu superior.',
  },
  {
    pergunta: 'A VIGMED atende empresas de qual porte?',
    resposta:
      'Atendemos desde pequenas empresas até grupos com múltiplas unidades, com portal dedicado por cliente.',
  },
  {
    pergunta: 'O acesso é separado por empresa?',
    resposta:
      'Sim. O isolamento por CNPJ garante que cada cliente enxergue somente seus documentos, colaboradores e mensagens.',
  },
  {
    pergunta: 'Dá para falar com a equipe pelo portal?',
    resposta:
      'Sim. Há canal de mensagens direto com a administração para dúvidas operacionais, documentos e acompanhamento.',
  },
  {
    pergunta: 'Os dados ficam seguros?',
    resposta:
      'O acesso é autenticado, restrito por perfil e registrado. Downloads e visualizações entram no histórico da empresa.',
  },
  {
    pergunta: 'Vocês ajudam com PCMSO e conformidade?',
    resposta:
      'Sim. Cuidamos do programa, exames periódicos e laudos digitais para manter a operação alinhada às obrigações.',
  },
]

export function LandingInstitucional() {
  const urlCliente = hrefPublico(ROTAS.auth.entrar)
  const [menuAberto, setMenuAberto] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [secaoAtiva, setSecaoAtiva] = useState('#inicio')
  const [temaClaro, setTemaClaro] = useState(false)

  useEffect(() => {
    const salvo = window.localStorage.getItem(CHAVE_TEMA)
    if (salvo === 'claro') setTemaClaro(true)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(CHAVE_TEMA, temaClaro ? 'claro' : 'escuro')
  }, [temaClaro])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = ['inicio', 'servicos', 'empresas', 'diferenciais', 'contato']
    const obs = ids.map((id) => {
      const el = document.getElementById(id)
      if (!el) return null
      const o = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setSecaoAtiva(`#${id}`)
        },
        { rootMargin: '-45% 0px -45% 0px' },
      )
      o.observe(el)
      return o
    })
    return () => obs.forEach((o) => o?.disconnect())
  }, [])

  return (
    <ScrollSuave>
      <div className={cn('vm', temaClaro && 'vm--claro')} id="inicio">
        <header className={cn('vm-nav', scrolled && 'is-scrolled', menuAberto && 'is-menu-open')}>
          <div className="vm-frame vm-nav-inner">
            <a href="#inicio" className="vm-brand">
              <span className="vm-brand-dot" aria-hidden />
              VIGMED
            </a>

            <nav className="vm-nav-links" aria-label="Principal">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(secaoAtiva === item.href && 'is-active')}
                >
                  {item.rotulo}
                </a>
              ))}
            </nav>

            <div className="vm-nav-acoes">
              <ToggleTemaLanding claro={temaClaro} onToggle={() => setTemaClaro((v) => !v)} />
              <Link href={urlCliente} className="vm-btn vm-btn--solid vm-btn--sm vm-nav-cta">
                <LockKey size={14} weight="bold" />
                <span>Área do cliente</span>
              </Link>
              <button
                type="button"
                className={cn('vm-nav-toggle', menuAberto && 'is-open')}
                aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={menuAberto}
                onClick={() => setMenuAberto((v) => !v)}
              >
                {menuAberto ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
              </button>
            </div>
          </div>

          {menuAberto && (
            <nav className="vm-nav-mobile" aria-label="Mobile">
              <div className="vm-frame vm-nav-mobile-inner">
                {NAV.map((item) => (
                  <a key={item.href} href={item.href} onClick={() => setMenuAberto(false)}>
                    {item.rotulo}
                  </a>
                ))}
                <Link
                  href={urlCliente}
                  className="vm-btn vm-btn--solid vm-btn--sm vm-nav-mobile-cta"
                  onClick={() => setMenuAberto(false)}
                >
                  <LockKey size={14} weight="bold" />
                  Área do cliente
                </Link>
              </div>
            </nav>
          )}
        </header>

        <section className="vm-hero" aria-label="Apresentação">
          <TeiaConexoes className="vm-teia" claro={temaClaro} />
          <div className="vm-frame vm-hero-inner">
            <p className="vm-hero-marca">
              <span>VIGMED</span>
            </p>
            <h1>Protegendo pessoas, fortalecendo negócios.</h1>
            <p className="vm-hero-lead">
              Medicina e segurança do trabalho com laudos digitais, acesso por empresa e
              conformidade no ritmo da operação.
            </p>
            <div className="vm-hero-acoes">
              <a href="#servicos" className="vm-btn vm-btn--signal vm-btn--lg">
                Explorar serviços
              </a>
              <a href="#contato" className="vm-btn vm-btn--ghost vm-btn--lg">
                Falar com a equipe
              </a>
            </div>
            <div className="vm-hero-meta" aria-label="Indicadores">
              <div>
                <strong>
                  <span data-count="5">0</span>+
                </strong>
                <span>anos</span>
              </div>
              <div>
                <strong>
                  <span data-count="48">0</span>+
                </strong>
                <span>empresas</span>
              </div>
              <div>
                <strong>
                  <span data-count="50">0</span>%
                </strong>
                <span>digital</span>
              </div>
            </div>
          </div>
        </section>

        <section id="servicos" aria-labelledby="titulo-servicos">
          <h2 id="titulo-servicos" className="sr-only">
            Serviços
          </h2>
          <ServicosTrilha itens={SERVICOS} />
        </section>

        <CorteDiagonal />

        <section className="vm-portal-bleed" id="empresas" aria-labelledby="titulo-empresas">
          <div className="vm-portal-shell vm-portal-shell--stack">
            <div className="vm-portal-copy vm-portal-copy--split vm-reveal">
              <div className="vm-portal-copy-col">
                <span className="vm-eyebrow">Portal empresas</span>
                <div className="vm-secao-cabeca">
                  <h2 id="titulo-empresas">Tudo da sua empresa, em um só lugar.</h2>
                  <p>
                    Laudos, comunicados e mensagens com a mesma fluidez de um app, isolados por
                    CNPJ e auditados do começo ao fim.
                  </p>
                </div>
                
              </div>

              <div className="vm-portal-copy-col vm-portal-copy-col--acoes">
                
                <ul className="vm-lista">
                  
                  {[
                    'Documentos e ASOs separados por empresa',
                    'Confirmação de leitura em comunicados',
                    'Canal direto com a administração',
                    'Histórico de downloads e acessos',
                  ].map((item) => (
                    <li key={item}>
                      <CheckCircle size={18} weight="fill" />
                      {item}
                    </li>
                  ))}
                </ul>
                
                <div className="vm-portal-chips">
                  <span>
                    <FileText size={14} weight="bold" /> Laudos
                  </span>
                  <span>
                    <ChatCircleDots size={14} weight="bold" /> Comunicados
                  </span>
                  <span>
                    <ShieldCheck size={14} weight="bold" /> Auditoria
                  </span>
                </div>

                <Link href={urlCliente} className="vm-btn vm-btn--signal vm-btn--lg">
                  <Buildings size={18} weight="bold" />
                  Acessar área do cliente
                </Link>
              </div>
            </div>

            <div className="vm-mock vm-mock--fade vm-reveal" aria-hidden>
              <div className="vm-mock-bar">
                <span className="vm-mock-dot" />
                <span className="vm-mock-dot" />
                <span className="vm-mock-dot" />
                <span className="vm-mock-url">docs.vigmed.com.br</span>
              </div>
              <div className="vm-mock-ui">
                <aside className="vm-mock-side">
                  {['Painel', 'Laudos', 'Equipe', 'Msgs', 'Perfil'].map((item, i) => (
                    <span key={item} className={cn(i === 0 && 'is-on')}>
                      {item}
                    </span>
                  ))}
                </aside>
                <main className="vm-mock-main">
                  <div className="vm-mock-head">
                    <div className="vm-mock-hello">
                      <strong>Olá, Empresa Exemplo!</strong>
                      <small>Exames e laudos ocupacionais liberados</small>
                    </div>
                    <span className="vm-mock-badge">Online</span>
                  </div>
                  <div className="vm-mock-kpis">
                    {[
                      ['128', 'Laudos'],
                      ['86', 'Colab.'],
                      ['142', 'Exames'],
                      ['16/05', 'Último'],
                    ].map(([v, r]) => (
                      <div key={r} className="vm-mock-kpi">
                        <b>{v}</b>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                  {['João da Silva', 'Maria Souza', 'Carlos Lima'].map((nome) => (
                    <div key={nome} className="vm-mock-row">
                      <span>{nome}</span>
                      <em className="vm-mock-pill">Disponível</em>
                    </div>
                  ))}
                </main>
              </div>
            </div>
          </div>
        </section>

        <section className="vm-secao" id="diferenciais" aria-labelledby="titulo-diff">
          <div className="vm-frame">
            <div className="vm-secao-cabeca vm-reveal">
              <span className="vm-eyebrow">Identidade</span>
              <h2 id="titulo-diff">Por que a VIGMED.</h2>
              <p>Clínica, conformidade e portal em uma operação só, sem ruído visual nem pasta solta.</p>
            </div>
            <div className="vm-diff">
              {DIFERENCIAIS.map((d) => {
                const Icone = d.icone
                return (
                  <article key={d.titulo} className="vm-reveal">
                    <span className="vm-diff-ico" aria-hidden>
                      <Icone size={24} weight="thin" />
                    </span>
                    <h3>{d.titulo}</h3>
                    <p>{d.texto}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="vm-secao vm-secao--panel" aria-labelledby="titulo-faq">
          <div className="vm-frame vm-faq-wrap">
            <div className="vm-secao-cabeca vm-reveal" data-faq-altura>
              <span className="vm-eyebrow">Dúvidas</span>
              <h2 id="titulo-faq">Perguntas objetivas.</h2>
              <p>
                Respostas diretas para RH, SESMT e gestores que precisam de clareza antes de
                entrar no portal.
              </p>
            </div>
            <div className="vm-reveal vm-faq-slider-host">
              <FaqAnimado itens={[...FAQ]} />
            </div>
          </div>
        </section>

        <footer className="vm-footer" id="contato">
          <div className="vm-frame">
            <p className="vm-footer-marca vm-reveal" aria-hidden>
              VIG<em>MED</em>
            </p>

            <div className="vm-footer-grid">
              <div>
                <p className="vm-footer-copy">
                  Medicina e segurança do trabalho. Portal digital para empresas que precisam de
                  laudos, comunicados e conformidade sem fricção.
                </p>
                <div className="vm-sociais">
                  <a href="https://wa.me/" aria-label="WhatsApp" target="_blank" rel="noreferrer">
                    <WhatsappLogo size={18} weight="bold" />
                  </a>
                  <a href="mailto:contato@vigmed.com.br" aria-label="E-mail">
                    <EnvelopeSimple size={18} weight="bold" />
                  </a>
                  <a href="mailto:contato@vigmed.com.br" aria-label="Suporte">
                    <Headphones size={18} weight="bold" />
                  </a>
                </div>
              </div>

              <div>
                <h4>Navegação</h4>
                <ul>
                  {NAV.map((item) => (
                    <li key={item.href}>
                      <a href={item.href}>{item.rotulo}</a>
                    </li>
                  ))}
                  <li>
                    <Link href={ROTAS.auth.entrar}>Entrar</Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4>Serviços</h4>
                <ul>
                  <li>
                    <a href="#servicos">PCMSO e PGR</a>
                  </li>
                  <li>
                    <a href="#servicos">Medicina do Trabalho</a>
                  </li>
                  <li>
                    <a href="#empresas">Portal empresas</a>
                  </li>
                  <li>
                    <a href="#servicos">eSocial</a>
                  </li>
                </ul>
              </div>

              <div>
                <h4>Contato</h4>
                <ul>
                  <li>
                    <a href="mailto:contato@vigmed.com.br">contato@vigmed.com.br</a>
                  </li>
                  <li>adm.vigmed.com.br</li>
                  <li>docs.vigmed.com.br</li>
                </ul>
                <a
                  href="mailto:contato@vigmed.com.br"
                  className="vm-btn vm-btn--signal vm-btn--sm"
                  style={{ marginTop: '1.25rem' }}
                >
                  <FirstAidKit size={14} weight="bold" />
                  Fale conosco
                </a>
              </div>
            </div>

            <div className="vm-footer-base">
              <span>© {new Date().getFullYear()} VIGMED Medicina e Saúde</span>
              <a href="mailto:contato@vigmed.com.br">contato@vigmed.com.br</a>
            </div>
          </div>
        </footer>
      </div>
    </ScrollSuave>
  )
}
