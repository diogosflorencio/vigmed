import Link from 'next/link'
import { ROTAS, hrefPublico } from '@/lib/rotas'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { IconeAnimado } from '@/components/ui/icone-animado'
import { Cartao } from '@/components/vig/Cartao'
import { Metrica } from '@/components/vig/Metrica'
import { Botao } from '@/components/vig/Botao'
import { formatarDataHora } from '@/lib/utils'

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
}

export function PainelInicioDocs({
  primeiroNome,
  totalDocumentos,
  comunicadosNaoLidos,
  mensagensNovas,
  documentosRecentes,
}: Props) {
  return (
    <SecaoPainel>
      <RevelarScroll>
        <div className="vig-hero-painel">
          <div>
            <p className="vig-landing-kicker" style={{ marginBottom: '0.35rem' }}>Portal empresas</p>
            <h2>Olá, {primeiroNome}!</h2>
            <p>
              Acompanhe documentos, comunicados e mensagens da sua empresa em um painel pensado
              para o dia a dia.
            </p>
          </div>
          <div className="vig-hero-painel-icone" aria-hidden>
            <IconeAnimado nome="shield" tamanho={28} />
          </div>
        </div>
      </RevelarScroll>

      <RevelarScroll atraso={0.04}>
        <div className="vig-metrica-grid">
          <Metrica
            rotulo="Documentos"
            valor={totalDocumentos}
            icone={<IconeAnimado nome="file-text" tamanho={16} />}
            destaque={totalDocumentos > 0}
          />
          <Metrica
            rotulo="Comunicados não lidos"
            valor={comunicadosNaoLidos}
            icone={<IconeAnimado nome="megaphone" tamanho={16} />}
            destaque={comunicadosNaoLidos > 0}
          />
          <Metrica
            rotulo="Mensagens novas"
            valor={mensagensNovas}
            icone={<IconeAnimado nome="message" tamanho={16} />}
            destaque={mensagensNovas > 0}
          />
        </div>
      </RevelarScroll>

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

      <RevelarScroll atraso={0.12}>
        <Cartao titulo="Documentos recentes" descricao="Últimos arquivos disponíveis no portal.">
          <div className="vig-lista-docs">
            {documentosRecentes.map((doc) => (
              <Link key={doc.id} href={hrefPublico(ROTAS.docs.documentos)} className="vig-lista-docs-item">
                <IconeAnimado nome="file-text" tamanho={13} className="shrink-0 text-(--color-text-3)" />
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
