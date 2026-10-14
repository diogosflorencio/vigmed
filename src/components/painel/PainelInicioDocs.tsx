import Link from 'next/link'
import { ROTAS, hrefPublico } from '@/lib/rotas'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { BannerPainel, type ChipBanner } from '@/components/painel/BannerPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { Cartao } from '@/components/vig/Cartao'
import { Metrica } from '@/components/vig/Metrica'
import { Botao } from '@/components/vig/Botao'
import { Selo } from '@/components/vig/Selo'
import { formatarBytes, formatarData, formatarDataHora } from '@/lib/utils'
import type { AlertaValidadeDocumento } from '@/lib/documentos/acoes'

interface ComunicadoResumo {
  id: string
  titulo: string
  publicado_em: string
  lido: boolean
  prioridade: string
}

interface Props {
  primeiroNome: string
  totalDocumentos: number
  comunicadosNaoLidos: number
  mensagensNovas: number
  documentosRecentes: {
    id: string
    titulo: string
    criado_em: string
    nome_arquivo?: string
  }[]
  alertasValidade: AlertaValidadeDocumento[]
  conversaNaoLidaId: string | null
  comunicadosRecentes: ComunicadoResumo[]
  cota: { usado: number; limite: number } | null
}

function linkDocumento(id: string) {
  return `${hrefPublico(ROTAS.docs.documentos)}?doc=${id}`
}

function linkComunicado(id: string) {
  return `${hrefPublico(ROTAS.docs.comunicados)}?comunicado=${id}`
}

function linkMensagens(conversaId: string | null) {
  const base = hrefPublico(ROTAS.docs.mensagens)
  return conversaId ? `${base}?conversa=${conversaId}` : base
}

const PRIORIDADE: Record<string, 'erro' | 'alerta' | 'padrao' | 'teal'> = {
  urgente: 'erro',
  alta: 'alerta',
  normal: 'padrao',
  baixa: 'teal',
}

export function PainelInicioDocs({
  primeiroNome,
  totalDocumentos,
  comunicadosNaoLidos,
  mensagensNovas,
  documentosRecentes,
  alertasValidade,
  conversaNaoLidaId,
  comunicadosRecentes,
  cota,
}: Props) {
  const temPendencias =
    comunicadosNaoLidos > 0 || mensagensNovas > 0 || alertasValidade.length > 0

  const pctCota =
    cota && cota.limite > 0 ? Math.min((cota.usado / cota.limite) * 100, 100) : null

  const chips: ChipBanner[] = [
    {
      rotulo: 'documentos',
      valor: totalDocumentos,
      tom: 'neutro',
      href: hrefPublico(ROTAS.docs.documentos),
    },
  ]
  if (comunicadosNaoLidos > 0) {
    chips.push({
      rotulo: comunicadosNaoLidos === 1 ? 'comunicado novo' : 'comunicados novos',
      valor: comunicadosNaoLidos,
      tom: 'sinal',
      href: hrefPublico(ROTAS.docs.comunicados),
    })
  }
  if (mensagensNovas > 0) {
    chips.push({
      rotulo: mensagensNovas === 1 ? 'mensagem nova' : 'mensagens novas',
      valor: mensagensNovas,
      tom: 'sinal',
      href: linkMensagens(conversaNaoLidaId),
    })
  }
  if (alertasValidade.length > 0) {
    chips.push({
      rotulo: alertasValidade.length === 1 ? 'alerta de validade' : 'alertas de validade',
      valor: alertasValidade.length,
      tom: 'alerta',
      href: hrefPublico(ROTAS.docs.documentos),
    })
  }

  return (
    <SecaoPainel>
      <RevelarScroll>
        <BannerPainel
          kicker="Portal empresas"
          titulo={`Olá, ${primeiroNome}.`}
          texto={
            temPendencias
              ? 'Há itens aguardando sua atenção. Revise comunicados, mensagens e documentos com validade próxima.'
              : 'Tudo em dia por aqui. Consulte documentos, comunicados e mensagens da sua empresa quando precisar.'
          }
          chips={chips}
          cta={
            temPendencias
              ? {
                  rotulo:
                    comunicadosNaoLidos > 0
                      ? 'Ver comunicados'
                      : mensagensNovas > 0
                        ? 'Abrir mensagens'
                        : 'Ver documentos',
                  href:
                    comunicadosNaoLidos > 0
                      ? hrefPublico(ROTAS.docs.comunicados)
                      : mensagensNovas > 0
                        ? linkMensagens(conversaNaoLidaId)
                        : hrefPublico(ROTAS.docs.documentos),
                }
              : { rotulo: 'Ir para documentos', href: hrefPublico(ROTAS.docs.documentos) }
          }
        />
      </RevelarScroll>

      {pctCota != null && (
        <RevelarScroll atraso={0.02}>
          <Cartao titulo="Armazenamento" descricao="Espaço usado por arquivos enviados pela sua empresa.">
            <div className="vig-dashboard-detalhe">
              <p>
                Uso da cota: <strong>{Math.round(pctCota)}%</strong> ({formatarBytes(cota!.usado)} de{' '}
                {formatarBytes(cota!.limite)})
              </p>
              <div className="vig-barra-progresso mt-2">
                <div
                  className={`vig-barra-progresso-fill${pctCota >= 90 ? ' vig-barra-progresso-fill--alerta' : ''}`}
                  style={{ width: `${pctCota}%` }}
                />
              </div>
              {pctCota >= 90 && (
                <p className="vig-dashboard-detalhe-sub text-(--color-danger) mt-2">
                  Cota quase esgotada: remova arquivos antigos ou fale com a VIGMED.
                </p>
              )}
            </div>
          </Cartao>
        </RevelarScroll>
      )}

      <RevelarScroll atraso={0.04}>
        <div className="vig-metrica-grid vig-metrica-grid--4">
          <Metrica
            rotulo="Documentos"
            valor={totalDocumentos}
            destaque={totalDocumentos > 0}
          />
          <Metrica
            rotulo="Comunicados não lidos"
            valor={comunicadosNaoLidos}
            destaque={comunicadosNaoLidos > 0}
          />
          <Metrica
            rotulo="Mensagens novas"
            valor={mensagensNovas}
            destaque={mensagensNovas > 0}
          />
          <Metrica
            rotulo="Docs a vencer"
            valor={alertasValidade.length}
            destaque={alertasValidade.length > 0}
          />
        </div>
      </RevelarScroll>

      {temPendencias && (
        <RevelarScroll atraso={0.06}>
          <Cartao titulo="Pendências" descricao="Itens que precisam da sua atenção.">
            <ul className="vig-lista-pendencias">
              {comunicadosNaoLidos > 0 && (
                <li>
                  <Link
                    href={`${hrefPublico(ROTAS.docs.comunicados)}?filtro=nao-lidos`}
                    className="vig-lista-pendencias-item"
                  >
                    <span>
                      {comunicadosNaoLidos} comunicado{comunicadosNaoLidos > 1 ? 's' : ''} não lido
                      {comunicadosNaoLidos > 1 ? 's' : ''}
                    </span>
                    <Selo variante="alerta">Ver</Selo>
                  </Link>
                </li>
              )}
              {mensagensNovas > 0 && (
                <li>
                  <Link href={linkMensagens(conversaNaoLidaId)} className="vig-lista-pendencias-item">
                    <span>
                      {mensagensNovas} mensagem{mensagensNovas > 1 ? 'ens' : ''} nova
                      {mensagensNovas > 1 ? 's' : ''}
                    </span>
                    <Selo variante="teal">Abrir chat</Selo>
                  </Link>
                </li>
              )}
              {alertasValidade.map((doc) => (
                <li key={doc.id}>
                  <Link href={linkDocumento(doc.id)} className="vig-lista-pendencias-item">
                    <span>
                      {doc.titulo}: {doc.status === 'vencido' ? 'vencido' : 'vence'} em{' '}
                      {formatarData(doc.valido_ate)}
                    </span>
                    <Selo variante={doc.status === 'vencido' ? 'erro' : 'alerta'}>
                      {doc.status === 'vencido' ? 'Vencido' : 'Atenção'}
                    </Selo>
                  </Link>
                </li>
              ))}
            </ul>
          </Cartao>
        </RevelarScroll>
      )}

      <RevelarScroll atraso={0.08}>
        <div className="vig-acesso-rapido">
          <Link href={hrefPublico(ROTAS.docs.documentos)} className="vig-acesso-item">
            <strong>Documentos</strong>
            <span>Enviar e baixar arquivos da empresa</span>
          </Link>
          <Link href={hrefPublico(ROTAS.docs.comunicados)} className="vig-acesso-item">
            <strong>Comunicados</strong>
            <span>Avisos da administração</span>
          </Link>
          <Link href={hrefPublico(ROTAS.docs.mensagens)} className="vig-acesso-item">
            <strong>Mensagens</strong>
            <span>Conversas com a equipe VIGMED</span>
          </Link>
        </div>
      </RevelarScroll>

      {comunicadosRecentes.length > 0 && (
        <RevelarScroll atraso={0.1}>
          <Cartao titulo="Comunicados recentes" descricao="Últimos avisos publicados pela VIGMED.">
            <div className="vig-lista-docs">
              {comunicadosRecentes.map((c) => (
                <Link key={c.id} href={linkComunicado(c.id)} className="vig-lista-docs-item">
                  <div className="vig-lista-docs-texto">
                    <p>{c.titulo}</p>
                    <span>{formatarDataHora(c.publicado_em)}</span>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-2">
                    {!c.lido && <Selo variante="alerta">Novo</Selo>}
                    <Selo variante={PRIORIDADE[c.prioridade] ?? 'padrao'}>{c.prioridade}</Selo>
                  </div>
                </Link>
              ))}
            </div>
            <Botao
              href={hrefPublico(ROTAS.docs.comunicados)}
              variante="fantasma"
              tamanho="sm"
              className="w-full mt-3"
              filho="Ver todos"
            />
          </Cartao>
        </RevelarScroll>
      )}

      <RevelarScroll atraso={0.12}>
        <Cartao titulo="Documentos recentes" descricao="Últimos arquivos disponíveis no portal.">
          <div className="vig-lista-docs">
            {documentosRecentes.map((doc) => (
              <Link key={doc.id} href={linkDocumento(doc.id)} className="vig-lista-docs-item">
                <div className="vig-lista-docs-texto">
                  <p>{doc.titulo}</p>
                  <span>{formatarDataHora(doc.criado_em)}</span>
                </div>
              </Link>
            ))}
            {documentosRecentes.length === 0 && (
              <p className="vig-lista-docs-vazio">Nenhum documento recente.</p>
            )}
          </div>
          <Botao
            href={hrefPublico(ROTAS.docs.documentos)}
            variante="fantasma"
            tamanho="sm"
            className="w-full mt-3"
            filho="Ver todos"
          />
        </Cartao>
      </RevelarScroll>
    </SecaoPainel>
  )
}
