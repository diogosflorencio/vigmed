import { ListaAtualizacoesAdm } from '@/components/atualizacoes/ListaAtualizacoesAdm'

export const metadata = { title: 'Atualizações · VIGMED Admin' }

export default function PaginaAtualizacoesAdmin() {
  return (
    <div className="painel-adm-layout">
      <ListaAtualizacoesAdm />
    </div>
  )
}
