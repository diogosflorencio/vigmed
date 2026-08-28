'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { Botao } from '@/components/vig/Botao'
import { FlipBox } from '@/components/vig/FlipBox'
import { MockupPainelLanding } from '@/components/vig/MockupPainelLanding'
import { ROTAS } from '@/lib/rotas'
import { obterUrlBaseDoAmbiente } from '@/lib/ambiente-edge'
import type { NomeIcone } from '@/lib/icones-animados'
import { cn } from '@/lib/utils'

const SERVICOS: { icone: NomeIcone; titulo: string; descricao: string }[] = [
  {
    icone: 'clipboard-check',
    titulo: 'Medicina do Trabalho',
    descricao: 'Exames admissionais, periódicos e demissionais com laudos digitais.',
  },
  {
    icone: 'users',
    titulo: 'Psicologia',
    descricao: 'Avaliações psicológicas e acompanhamento ocupacional humanizado.',
  },
  {
    icone: 'shield',
    titulo: 'Saúde Ocupacional',
    descricao: 'Programas de prevenção, PCMSO e gestão integrada de riscos.',
  },
  {
    icone: 'file-text',
    titulo: 'Documentos',
    descricao: 'Centralize laudos, ASOs e comunicados por empresa com auditoria.',
  },
  {
    icone: 'megaphone',
    titulo: 'Comunicados',
    descricao: 'Avisos oficiais com confirmação de leitura para toda a equipe.',
  },
  {
    icone: 'message',
    titulo: 'Mensagens',
    descricao: 'Canal direto entre administração e empresas clientes.',
  },
]

const BENEFICIOS: { icone: NomeIcone; titulo: string; texto: string }[] = [
  {
    icone: 'shield',
    titulo: 'Conformidade NR',
    texto: 'PCMSO, exames e laudos organizados com histórico de acesso.',
  },
  {
    icone: 'users',
    titulo: 'Equipe própria',
    texto: 'Médicos, enfermeiros e técnicos de segurança no dia a dia da operação.',
  },
  {
    icone: 'file-text',
    titulo: 'Documentos centralizados',
    texto: 'Cada empresa acessa só o que lhe pertence, sem planilhas paralelas.',
  },
  {
    icone: 'message',
    titulo: 'Canal com a administração',
    texto: 'Comunicados oficiais e mensagens dentro do portal, sem depender de e-mail solto.',
  },
]

const DESTAQUES = [
  { titulo: 'Laudos digitais', texto: 'ASOs e documentos entregues no portal' },
  { titulo: 'Portal por empresa', texto: 'Acesso isolado para cada cliente' },
  { titulo: 'Comunicados oficiais', texto: 'Com confirmação de leitura' },
  { titulo: 'Auditoria', texto: 'Registro de downloads e visualizações' },
] as const

const FAQ = [
  {
    pergunta: 'Como minha empresa acessa laudos e documentos?',
    resposta: 'Após convite da administração, ative sua conta e entre em docs.vigmed.com.br. Cada empresa vê apenas os arquivos destinados a ela.',
  },
  {
    pergunta: 'Os exames ocupacionais ficam registrados?',
    resposta: 'Sim. Laudos, ASOs e documentos complementares ficam arquivados digitalmente com histórico de acesso e download.',
  },
  {
    pergunta: 'Posso escolher como navegar no painel?',
    resposta: 'Sim. Em Meu perfil → Aparência você escolhe dock inferior, barra lateral ou menu superior.',
  },
  {
    pergunta: 'A VIGMED atende empresas de qual porte?',
    resposta: 'Atendemos desde pequenas empresas até grupos com múltiplas unidades, com portal dedicado por cliente.',
  },
] as const

const PASSOS = [
  { num: '01', titulo: 'Diagnóstico', texto: 'Mapeamos riscos, demandas regulatórias e perfil da operação.' },
  { num: '02', titulo: 'Programa', texto: 'Estruturamos PCMSO, exames e documentação conforme NR.' },
  { num: '03', titulo: 'Execução', texto: 'Realizamos exames, laudos e acompanhamento contínuo.' },
  { num: '04', titulo: 'Portal', texto: 'Entrega digital com laudos, comunicados e mensagens integradas.' },
] as const

const NAV = [
  { href: '#inicio', rotulo: 'Início' },
  { href: '#servicos', rotulo: 'Serviços' },
  { href: '#empresas', rotulo: 'Empresas' },
  { href: '#contato', rotulo: 'Contato' },
] as const

export function LandingInstitucional() {
  const reduzir = useReducedMotion()
  const urlDocs = obterUrlBaseDoAmbiente('docs')
  const [menuMobile, definirMenuMobile] = useState(false)
  const [secaoAtiva, definirSecaoAtiva] = useState('#inicio')

  useEffect(() => {
    const ids = NAV.map((n) => n.href.replace('#', ''))
    const observadores = ids.map((id) => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) definirSecaoAtiva(`#${id}`)
        },
        { rootMargin: '-40% 0px -50% 0px' },
      )
      obs.observe(el)
      return obs
    })
    return () => observadores.forEach((o) => o?.disconnect())
  }, [])

  return (
    <div className="vig-landing" id="inicio">
      <header className={cn('vig-landing-nav', menuMobile && 'vig-landing-nav--aberto')}>
        <div className="vig-landing-frame vig-landing-nav-inner">
          <a href="#inicio" className="vig-landing-logo">
            <span className="vig-landing-logo-icone" aria-hidden>
              <IconeAnimado nome="shield" tamanho={16} />
            </span>
            VIGMED
          </a>

          <nav className="vig-landing-nav-links" aria-label="Principal">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(secaoAtiva === item.href && 'vig-landing-nav-link--ativo')}
                onClick={() => definirMenuMobile(false)}
              >
                {item.rotulo}
              </a>
            ))}
          </nav>

          <div className="vig-landing-nav-acoes">
            <Botao href={ROTAS.auth.entrar} variante="primario" tamanho="sm" filho="Área do cliente" />
            <button
              type="button"
              className="vig-landing-nav-toggle"
              aria-label={menuMobile ? 'Fechar menu' : 'Abrir menu'}
              onClick={() => definirMenuMobile((v) => !v)}
            >
              <IconeAnimado nome={menuMobile ? 'x' : 'menu'} tamanho={18} />
            </button>
          </div>
        </div>

        {menuMobile && (
          <nav className="vig-landing-nav-mobile" aria-label="Mobile">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(secaoAtiva === item.href && 'vig-landing-nav-link--ativo')}
                onClick={() => definirMenuMobile(false)}
              >
                {item.rotulo}
              </a>
            ))}
            <Link href={ROTAS.auth.entrar} onClick={() => definirMenuMobile(false)}>
              Entrar
            </Link>
          </nav>
        )}
      </header>

      <section className="vig-landing-hero" aria-label="Protegendo pessoas">
        <div className="vig-landing-hero-bg" aria-hidden />
        <div className="vig-landing-hero-orbs" aria-hidden />
        <div className="vig-landing-frame vig-landing-hero-grid">
          <motion.div
            initial={reduzir ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="vig-landing-kicker vig-landing-kicker--hero">Medicina e segurança do trabalho</p>
            <h1>
              Medicina do trabalho
              <br />
              com laudos no portal.
            </h1>
            <p className="vig-landing-hero-lead">
              Exames, laudos, comunicados e mensagens para empresas clientes, com acesso
              separado por CNPJ e rastreio de quem baixou cada arquivo.
            </p>
            <div className="vig-landing-hero-acoes">
              <Botao href="#servicos" variante="primario" tamanho="lg" filho="Ver serviços" />
              <Botao href="#contato" variante="contorno" tamanho="lg" filho="Falar conosco" />
            </div>
          </motion.div>

          <motion.aside
            className="vig-landing-hero-stack"
            initial={reduzir ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="vig-landing-hero-card">
              <div className="vig-landing-hero-card-inner">
                <span className="vig-landing-hero-card-ico" aria-hidden>
                  <IconeAnimado nome="shield" tamanho={22} />
                </span>
                <div>
                  <h3>Laudos e documentos no portal</h3>
                  <p>
                    Cada empresa acessa só os arquivos liberados para ela, com registro
                    de download e visualização.
                  </p>
                </div>
              </div>
            </div>
            <div className="vig-landing-hero-badge">
              <IconeAnimado nome="check-circle" tamanho={16} />
              <span>Conformidade NR e eSocial</span>
            </div>
          </motion.aside>
        </div>
      </section>

      <section className="vig-landing-stats" aria-label="Destaques do portal">
        <div className="vig-landing-frame vig-landing-stats-grid">
          {DESTAQUES.map((s, i) => (
            <RevelarScroll key={s.titulo} atraso={i * 0.06} className="vig-landing-stat">
              <p className="vig-landing-stat-valor vig-landing-stat-valor--texto">{s.titulo}</p>
              <p className="vig-landing-stat-rotulo">{s.texto}</p>
            </RevelarScroll>
          ))}
        </div>
      </section>

      <section className="vig-landing-secao" id="servicos" aria-labelledby="titulo-servicos">
        <div className="vig-landing-frame">
          <RevelarScroll>
            <p className="vig-landing-kicker">Nossos serviços</p>
            <h2 className="vig-landing-titulo-secao" id="titulo-servicos">
              O que fazemos
            </h2>
            <p className="vig-landing-subtitulo">
              Passe o mouse nos cards para ver o resumo de cada frente de trabalho.
            </p>
          </RevelarScroll>

          <div className="vig-landing-servicos-grid">
            {SERVICOS.map((s, i) => (
              <RevelarScroll key={s.titulo} atraso={i * 0.04}>
                <FlipBox
                  titulo={s.titulo}
                  descricao={s.descricao}
                  icone={<IconeAnimado nome={s.icone} tamanho={28} />}
                />
              </RevelarScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="vig-landing-secao vig-landing-secao--escuro" id="empresas" aria-labelledby="titulo-empresas">
        <div className="vig-landing-frame vig-landing-area-cliente">
          <RevelarScroll>
            <p className="vig-landing-kicker">Portal empresas</p>
            <h2 className="vig-landing-titulo-secao" id="titulo-empresas">
              Uma área especial para empresas
            </h2>
            <p className="vig-landing-subtitulo">
              Acesse laudos, documentos, comunicados e mensagens da administração em um painel
              exclusivo, no computador ou no celular.
            </p>
            <ul className="vig-landing-lista-check">
              {[
                'Laudos e documentos por empresa',
                'Comunicados com confirmação de leitura',
                'Mensagens diretas com a administração',
                'Auditoria de downloads e acessos',
              ].map((item) => (
                <li key={item}>
                  <IconeAnimado nome="check-circle" tamanho={15} />
                  {item}
                </li>
              ))}
            </ul>
            <Botao href={urlDocs} variante="teal" tamanho="lg" filho="Acessar área do cliente" />
          </RevelarScroll>

          <RevelarScroll atraso={0.08}>
            <MockupPainelLanding />
          </RevelarScroll>
        </div>
      </section>

      <section className="vig-landing-secao" aria-labelledby="titulo-beneficios">
        <div className="vig-landing-frame">
          <RevelarScroll>
            <p className="vig-landing-kicker">Diferenciais</p>
            <h2 className="vig-landing-titulo-secao" id="titulo-beneficios">
              Como trabalhamos no dia a dia
            </h2>
          </RevelarScroll>

          <div className="vig-landing-beneficios">
            {BENEFICIOS.map((b, i) => (
              <RevelarScroll key={b.titulo} atraso={i * 0.05} className="vig-landing-beneficio">
                <div className="vig-landing-beneficio-icone">
                  <IconeAnimado nome={b.icone} tamanho={22} />
                </div>
                <h3>{b.titulo}</h3>
                <p>{b.texto}</p>
              </RevelarScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="vig-landing-secao vig-landing-secao--clara" aria-labelledby="titulo-processo">
        <div className="vig-landing-frame">
          <RevelarScroll>
            <p className="vig-landing-kicker">Como trabalhamos</p>
            <h2 className="vig-landing-titulo-secao" id="titulo-processo">
              Do diagnóstico ao portal digital
            </h2>
          </RevelarScroll>
          <div className="vig-landing-passos">
            {PASSOS.map((p, i) => (
              <RevelarScroll key={p.num} atraso={i * 0.05} className="vig-landing-passo">
                <span className="vig-landing-passo-num">{p.num}</span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </RevelarScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="vig-landing-secao" aria-labelledby="titulo-faq">
        <div className="vig-landing-frame vig-landing-faq">
          <RevelarScroll>
            <p className="vig-landing-kicker">Dúvidas frequentes</p>
            <h2 className="vig-landing-titulo-secao" id="titulo-faq">
              Perguntas comuns
            </h2>
          </RevelarScroll>
          <div className="vig-landing-faq-lista">
            {FAQ.map((item, i) => (
              <RevelarScroll key={item.pergunta} atraso={i * 0.04} className="vig-landing-faq-item">
                <h3>{item.pergunta}</h3>
                <p>{item.resposta}</p>
              </RevelarScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="vig-landing-cta" aria-label="Chamada para ação">
        <div className="vig-landing-frame vig-landing-cta-inner">
          <RevelarScroll>
            <h2>Precisa falar com a equipe ou entrar no portal?</h2>
            <p>Use o contato abaixo ou acesse com o e-mail liberado pela administração.</p>
            <div className="vig-landing-hero-acoes">
              <Botao href={ROTAS.auth.entrar} variante="teal" tamanho="lg" filho="Entrar no portal" />
              <Botao href="#contato" variante="secundario" tamanho="lg" filho="Ver contato" />
            </div>
          </RevelarScroll>
        </div>
      </section>

      <footer className="vig-landing-footer" id="contato">
        <div className="vig-landing-frame">
          <div className="vig-landing-footer-grid">
            <div>
              <span className="vig-landing-logo vig-landing-logo--footer">
                <span className="vig-landing-logo-icone" aria-hidden>
                  <IconeAnimado nome="shield" tamanho={16} />
                </span>
                VIGMED
              </span>
              <p className="vig-landing-footer-slogan">Medicina e segurança do trabalho.</p>
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
              <h4>Contato</h4>
              <ul>
                <li>contato@vigmed.com.br</li>
                <li>adm.vigmed.com.br</li>
                <li>docs.vigmed.com.br</li>
              </ul>
            </div>
          </div>

          <div className="vig-landing-footer-base">
            <span>© {new Date().getFullYear()} VIGMED Medicina e Saúde</span>
            <a href="mailto:contato@vigmed.com.br">contato@vigmed.com.br</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
