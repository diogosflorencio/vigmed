import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { Cartao } from '@/components/vig/Cartao'
import { Botao } from '@/components/vig/Botao'
import { hrefPublico, ROTAS } from '@/lib/rotas'
import { formatarDataHora } from '@/lib/utils'
import type { RegistroAuditoria } from '@/lib/auditoria/acoes'

const ROTULOS: Record<string, string> = {
  download: 'Download',
  envio: 'Upload',
  exclusao: 'Exclusão',
  criacao: 'Criação',
  atualizacao: 'Atualização',
  criacao_empresa: 'Nova empresa',
  criacao_usuario: 'Convite',
  atualizacao_empresa: 'Empresa atualizada',
}

function descreverEvento(r: RegistroAuditoria): string {
  const quem = r.perfis?.nome_completo || r.perfis?.email || 'Sistema'
  const empresa = r.empresas?.nome_fantasia
  const det = r.detalhes as { titulo?: string; email?: string; nome?: string }
  const rotulo = ROTULOS[r.acao] ?? r.acao

  if (r.recurso === 'documento' && det.titulo) return `${rotulo}: ${det.titulo}`
  if (r.recurso === 'comunicado' && det.titulo) return `${rotulo} comunicado: ${det.titulo}`
  if (r.acao === 'criacao_usuario' && det.email) return `Convite: ${det.email}`
  if (r.acao === 'criacao_empresa' && det.nome) return `Empresa: ${det.nome}`
  if (empresa) return `${rotulo}: ${empresa}`
  return `${rotulo}: ${quem}`
}

interface Props {
  registros: RegistroAuditoria[]
}

export function PainelAtividadeRecenteAdm({ registros }: Props) {
  if (registros.length === 0) return null

  return (
    <RevelarScroll atraso={0.03}>
      <Cartao titulo="Atividade recente" descricao="Últimos eventos registrados na plataforma.">
        <ul className="vig-lista-atividade">
          {registros.map((r) => (
            <li key={r.id} className="vig-lista-atividade-item">
              <div className="vig-lista-atividade-texto">
                <p>{descreverEvento(r)}</p>
                <span>{formatarDataHora(r.criado_em)}</span>
              </div>
            </li>
          ))}
        </ul>
        <Botao
          href={hrefPublico(ROTAS.adm.auditoria)}
          variante="fantasma"
          tamanho="sm"
          className="mt-3"
          filho="Ver auditoria completa"
        />
      </Cartao>
    </RevelarScroll>
  )
}
