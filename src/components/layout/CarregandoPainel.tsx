import { EsqueletoGrupo } from '@/components/vig/Esqueleto'

interface Props {
  rotulo?: string
}

/** Fallback de Suspense com esqueleto animado */
export function CarregandoPainel({ rotulo = 'Carregando' }: Props) {
  return (
    <div className="p-6 max-w-3xl">
      <EsqueletoGrupo linhas={5} rotulo={rotulo} />
    </div>
  )
}
