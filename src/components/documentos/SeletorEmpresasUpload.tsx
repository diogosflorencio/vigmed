'use client'

import { cn } from '@/lib/utils'

interface Props {
  empresas: { id: string; nome_fantasia: string }[]
  selecionadas: string[]
  onChange: (ids: string[]) => void
  fixas?: string[]
  titulo?: string
  className?: string
}

export function SeletorEmpresasUpload({
  empresas,
  selecionadas,
  onChange,
  fixas = [],
  titulo = 'Empresas destino do upload',
  className,
}: Props) {
  const idsFixas = new Set(fixas)
  const selecionaveis = empresas.filter((e) => !idsFixas.has(e.id))
  const todasSelecionadas =
    selecionaveis.length > 0 && selecionaveis.every((e) => selecionadas.includes(e.id))

  function alternar(id: string) {
    if (idsFixas.has(id)) return
    onChange(
      selecionadas.includes(id)
        ? selecionadas.filter((x) => x !== id)
        : [...selecionadas, id],
    )
  }

  function alternarTodas() {
    if (todasSelecionadas) {
      onChange(selecionadas.filter((id) => idsFixas.has(id)))
    } else {
      onChange([...new Set([...selecionadas, ...selecionaveis.map((e) => e.id)])])
    }
  }

  return (
    <div className={cn('rounded-xl border border-(--color-border) bg-(--color-surface) p-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-sm font-medium text-(--color-text-1)">
          {titulo}
          {selecionadas.length > 0 && (
            <span className="ml-2 text-xs font-normal text-(--color-text-3)">
              ({selecionadas.length} selecionada{selecionadas.length > 1 ? 's' : ''})
            </span>
          )}
        </span>
        {selecionaveis.length > 1 && (
          <button
            type="button"
            className="text-xs font-medium text-(--color-accent) hover:underline"
            onClick={alternarTodas}
          >
            {todasSelecionadas ? 'Desmarcar todas' : 'Selecionar todas'}
          </button>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-48 overflow-y-auto">
        {empresas.map((e) => {
          const fixa = idsFixas.has(e.id)
          const marcada = selecionadas.includes(e.id)
          return (
            <label
              key={e.id}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-2 py-1.5 text-sm cursor-pointer transition-colors',
                marcada
                  ? 'border-(--color-accent) bg-(--color-info-bg)'
                  : 'border-(--color-border) text-(--color-text-2)',
                fixa && 'opacity-80 cursor-default',
              )}
            >
              <input
                type="checkbox"
                checked={marcada}
                disabled={fixa}
                onChange={() => alternar(e.id)}
              />
              <span className="truncate">{e.nome_fantasia}</span>
              {fixa && <span className="text-[10px] text-(--color-text-3)">(fixa)</span>}
            </label>
          )
        })}
      </div>

      {selecionadas.length === 0 && (
        <p className="mt-2 text-xs text-(--color-warning)">
          Selecione ao menos uma empresa antes de enviar arquivos.
        </p>
      )}
    </div>
  )
}
