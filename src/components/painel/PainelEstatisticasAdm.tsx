import type { ReactNode } from 'react'
import type { EstatisticasPainelAdmin } from '@/types'
import { formatarBytes } from '@/lib/utils'
import { barraProgresso, blocoBarras } from '@/lib/painel/graficos-texto'

interface Props {
  dados: EstatisticasPainelAdmin
}

function N({ children }: { children: ReactNode }) {
  return <strong className="painel-estat-num">{children}</strong>
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="painel-estat-secao">
      <h2 className="painel-estat-secao-titulo">{titulo}</h2>
      {children}
    </section>
  )
}

function Texto({ children }: { children: ReactNode }) {
  return <p className="painel-estat-texto">{children}</p>
}

function Ascii({ conteudo }: { conteudo: string }) {
  if (!conteudo) return null
  return <pre className="painel-estat-ascii" aria-hidden>{conteudo}</pre>
}

/** Estatísticas em texto + gráficos construídos com caracteres */
export function PainelEstatisticasAdm({ dados }: Props) {
  const { empresas: e, usuarios: u, documentos: d, comunicados: c, mensagens: m, blog: b, convites: v, auditoria: a } =
    dados

  const pctArmazenamento =
    e.armazenamentoLimite > 0
      ? Math.round((e.armazenamentoEmpresas / e.armazenamentoLimite) * 100)
      : 0

  const empresasItens = [
    { nome: 'Ativas', valor: e.ativas },
    { nome: 'Inativas', valor: e.inativas },
    { nome: 'Suspensas', valor: e.suspensas },
  ]

  const usuariosItens = [
    { nome: 'Admin sistema', valor: u.administradores },
    { nome: 'Admin empresa', valor: u.administradoresEmpresa },
    { nome: 'Usu. empresa', valor: u.usuariosEmpresa },
  ]
  const totalUsuariosPorPapel = u.administradores + u.administradoresEmpresa + u.usuariosEmpresa

  const documentosItens = [
    { nome: 'Criados 7d', valor: d.criados7d },
    { nome: 'Criados 30d', valor: d.criados30d },
    { nome: 'Uploads 7d', valor: d.uploads7d },
    { nome: 'Downloads 7d', valor: d.downloads7d },
  ]

  const auditoriaItens = [
    { nome: 'Logins', valor: a.logins7d },
    { nome: 'Envios', valor: a.envios7d },
    { nome: 'Downloads', valor: a.downloads7d },
    { nome: 'Eventos', valor: a.eventos7d },
  ]

  const blogItens = [
    { nome: 'Publicados', valor: b.publicados },
    { nome: 'Rascunhos', valor: b.rascunhos },
    { nome: 'Arquivados', valor: b.arquivados },
  ]
  const totalPostsBlog = b.publicados + b.rascunhos + b.arquivados

  const engajamentoItens = [
    { nome: 'Comunicados', valor: c.ativos },
    { nome: 'Leituras', valor: c.leituras },
    { nome: 'Mensagens 7d', valor: m.mensagens7d },
    { nome: 'Views blog 7d', valor: b.visualizacoes7d },
  ]

  const convitesItens = [
    { nome: 'Pendentes', valor: v.pendentes },
    { nome: 'Aceitos 30d', valor: v.aceitos30d },
  ]

  return (
    <article className="painel-estatisticas" aria-label="Estatísticas da plataforma">
      <header className="painel-estat-topo">
        <h1 className="painel-estat-titulo">Visão geral</h1>
        <Texto>
          <N>{e.ativas}</N> empresas ativas · <N>{u.ativos}</N> usuários ativos · <N>{d.ativos}</N> documentos
          · VIGMED <N>{formatarBytes(e.armazenamentoVigmed)}</N> (ilimitado) · empresas{' '}
          <N>{formatarBytes(e.armazenamentoEmpresas)}</N> de{' '}
          <N>{formatarBytes(e.armazenamentoLimite)}</N> ({pctArmazenamento}% da cota) ·{' '}
          <N>{a.eventos24h}</N> eventos nas últimas 24 h
        </Texto>
      </header>

      <div className="painel-estat-grid">
        <div className="painel-estat-col">
          <Secao titulo="Empresas">
            <Texto>
              <N>{e.ativas}</N> ativas · <N>{e.inativas}</N> inativas · <N>{e.suspensas}</N> suspensas ·{' '}
              <N>{e.total}</N> cadastradas
            </Texto>
            <Ascii conteudo={blocoBarras(empresasItens, { total: e.total, modo: 'parte' })} />
            <Texto>
              VIGMED (admin) <N>{formatarBytes(e.armazenamentoVigmed)}</N>, sem limite · Cota empresas{' '}
              <N>{formatarBytes(e.armazenamentoEmpresas)}</N> de{' '}
              <N>{formatarBytes(e.armazenamentoLimite)}</N>, média{' '}
              <N>{formatarBytes(e.mediaArmazenamento)}</N> por empresa
              {e.maiorConsumo ? (
                <>
                  {' '}
                  · maior uso de cota <N>{e.maiorConsumo.nome}</N> ({formatarBytes(e.maiorConsumo.bytes)})
                </>
              ) : null}
            </Texto>
            <Texto>
              Total na plataforma <N>{formatarBytes(e.armazenamentoUsado)}</N> (VIGMED + empresas)
            </Texto>
            <Ascii conteudo={barraProgresso(pctArmazenamento)} />
          </Secao>

          <Secao titulo="Usuários">
            <Texto>
              <N>{u.ativos}</N> ativos · <N>{u.inativos}</N> inativos · <N>{u.loginsRecentes}</N> com login nos
              últimos 7 dias
            </Texto>
            <Ascii
              conteudo={blocoBarras(usuariosItens, {
                total: totalUsuariosPorPapel,
                modo: 'parte',
              })}
            />
          </Secao>

          <Secao titulo="Documentos">
            <Texto>
              <N>{d.ativos}</N> ativos de <N>{d.total}</N> no total · <N>{d.categorias}</N> categorias · volume{' '}
              <N>{formatarBytes(d.somaTamanho)}</N> · <N>{d.somaDownloads}</N> downloads acumulados
            </Texto>
            <Ascii conteudo={blocoBarras(documentosItens, { modo: 'comparativo' })} />
          </Secao>

          <Secao titulo="Blog (ainda não há)">
            <Texto>
              <N>{b.publicados}</N> publicados · <N>{b.rascunhos}</N> rascunhos · <N>{b.arquivados}</N> arquivados ·{' '}
              <N>{b.visualizacoes7d}</N> visualizações nos últimos 7 dias
            </Texto>
            <Ascii
              conteudo={blocoBarras(blogItens, {
                total: totalPostsBlog,
                modo: 'parte',
              })}
            />
          </Secao>
        </div>

        <div className="painel-estat-col">
          <Secao titulo="Comunicados e mensagens">
            <Texto>
              <N>{c.ativos}</N> comunicados ativos de <N>{c.total}</N> publicados · <N>{c.fixados}</N> fixados ·{' '}
              <N>{c.leituras}</N> leituras confirmadas
            </Texto>
            <Texto>
              <N>{m.conversasAtivas}</N> conversas ativas · <N>{m.totalMensagens}</N> mensagens no total ·{' '}
              <N>{m.mensagens7d}</N> mensagens nos últimos 7 dias
            </Texto>
            <Ascii conteudo={blocoBarras(engajamentoItens, { modo: 'comparativo' })} />
          </Secao>

          <Secao titulo="Convites">
            <Texto>
              <N>{v.pendentes}</N> convites pendentes · <N>{v.aceitos30d}</N> aceitos nos últimos 30 dias
            </Texto>
            <Ascii conteudo={blocoBarras(convitesItens, { modo: 'comparativo' })} />
          </Secao>

          <Secao titulo="Auditoria (7 dias)">
            <Texto>
              <N>{a.eventos24h}</N> eventos nas últimas 24 h · <N>{a.eventos7d}</N> em 7 dias
            </Texto>
            <Ascii conteudo={blocoBarras(auditoriaItens, { modo: 'comparativo' })} />
          </Secao>
        </div>
      </div>
    </article>
  )
}
