import Link from 'next/link'
import { RevelarScroll } from '@/components/ui/revelar-scroll'
import { hrefPublico, ROTAS } from '@/lib/rotas'

const LINKS = [
  { href: ROTAS.adm.empresas, rotulo: 'Empresas', desc: 'Clientes e cotas' },
  { href: ROTAS.adm.documentos, rotulo: 'Documentos', desc: 'Arquivos e validade' },
  { href: ROTAS.adm.comunicados, rotulo: 'Comunicados', desc: 'Avisos às empresas' },
  { href: ROTAS.adm.mensagens, rotulo: 'Mensagens', desc: 'Chat com clientes' },
  { href: ROTAS.adm.usuarios, rotulo: 'Pessoas', desc: 'Convites e acessos' },
  { href: ROTAS.adm.relatorios, rotulo: 'Relatórios', desc: 'Uso consolidado' },
] as const

export function PainelAcessoRapidoAdm() {
  return (
    <RevelarScroll atraso={0.05}>
      <div className="vig-acesso-rapido vig-acesso-rapido--adm">
        {LINKS.map((item) => (
          <Link key={item.href} href={hrefPublico(item.href)} className="vig-acesso-item">
            <strong>{item.rotulo}</strong>
            <span>{item.desc}</span>
          </Link>
        ))}
      </div>
    </RevelarScroll>
  )
}
