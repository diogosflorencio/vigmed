import Link from 'next/link'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { Cartao } from '@/components/vig/Cartao'
import { Selo } from '@/components/vig/Selo'
import { Botao } from '@/components/vig/Botao'
import { hrefPublico, ROTAS } from '@/lib/rotas'
import { formatarData } from '@/lib/utils'
import type { PendenciasAdmin } from '@/lib/painel/acoes'

interface Props {
  pendencias: PendenciasAdmin
}

export function PainelPendenciasAdm({ pendencias }: Props) {
  const { alertasValidade, mensagensNaoLidas, retencaoPendente, conversaNaoLidaId, convitesPendentes } =
    pendencias
  const linkMensagens =
    conversaNaoLidaId != null
      ? `${hrefPublico(ROTAS.adm.mensagens)}?conversa=${conversaNaoLidaId}`
      : hrefPublico(ROTAS.adm.mensagens)
  const temAlgo =
    alertasValidade.length > 0 ||
    mensagensNaoLidas > 0 ||
    retencaoPendente > 0 ||
    convitesPendentes > 0

  if (!temAlgo) return null

  return (
    <RevelarScroll atraso={0.02}>
      <Cartao
        titulo="Atenção necessária"
        descricao="Itens que podem precisar de ação da equipe VIGMED."
      >
        <ul className="vig-lista-pendencias">
          {mensagensNaoLidas > 0 && (
            <li>
              <Link href={linkMensagens} className="vig-lista-pendencias-item">
                <span>
                  {mensagensNaoLidas} mensagem{mensagensNaoLidas > 1 ? 'ens' : ''} não lida
                  {mensagensNaoLidas > 1 ? 's' : ''} de empresas
                </span>
                <Selo variante="teal">Responder</Selo>
              </Link>
            </li>
          )}
          {alertasValidade.map((doc) => (
            <li key={doc.id}>
              <Link
                href={`${hrefPublico(ROTAS.adm.documentos)}?doc=${doc.id}`}
                className="vig-lista-pendencias-item"
              >
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
          {retencaoPendente > 0 && (
            <li>
              <Link href={hrefPublico(ROTAS.adm.configuracoes)} className="vig-lista-pendencias-item">
                <span>
                  {retencaoPendente} documento{retencaoPendente > 1 ? 's' : ''} elegível
                  {retencaoPendente > 1 ? 'is' : ''} para remoção por retenção
                </span>
                <Selo variante="alerta">Revisar</Selo>
              </Link>
            </li>
          )}
          {convitesPendentes > 0 && (
            <li>
              <Link href={hrefPublico(ROTAS.adm.usuarios)} className="vig-lista-pendencias-item">
                <span>
                  {convitesPendentes} convite{convitesPendentes > 1 ? 's' : ''} aguardando aceite
                </span>
                <Selo variante="padrao">Ver pessoas</Selo>
              </Link>
            </li>
          )}
        </ul>
        <Botao
          href={hrefPublico(ROTAS.adm.documentos)}
          variante="fantasma"
          tamanho="sm"
          className="mt-3"
          filho="Ver documentos"
        />
      </Cartao>
    </RevelarScroll>
  )
}
