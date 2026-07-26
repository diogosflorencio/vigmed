import { listarAuditoria } from '@/lib/auditoria/acoes'
import { PainelAuditoria } from '@/components/auditoria/PainelAuditoria'

export const metadata = { title: 'Auditoria - VIGMED Admin' }

export default async function PaginaAuditoria() {
  const resultado = await listarAuditoria({ pagina: 1, porPagina: 50 })

  return (
    <PainelAuditoria
      registros={resultado.registros}
      total={resultado.total}
      pagina={resultado.pagina}
      porPagina={resultado.porPagina}
      totalPaginas={resultado.totalPaginas}
    />
  )
}
