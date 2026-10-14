'use client'

import { cn, formatarBytes } from '@/lib/utils'

export interface EmpresaUploadOpcao {
  id: string
  nome_fantasia: string
  armazenamento_limite?: number
  consumoEmpresa?: number
}

interface Props {
  empresas: EmpresaUploadOpcao[]
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
  titulo = 'Empresas destino',
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
    <div className={cn('docs-empresas', className)}>
      <div className="docs-empresas-topo">
        <span className="docs-empresas-titulo">
          {titulo}
          {selecionadas.length > 0 ? ` · ${selecionadas.length}` : ''}
        </span>
        {selecionaveis.length > 1 && (
          <button type="button" className="docs-empresas-acao" onClick={alternarTodas}>
            {todasSelecionadas ? 'Limpar' : 'Todas'}
          </button>
        )}
      </div>

      <div className="docs-empresas-lista">
        {empresas.map((e) => {
          const fixa = idsFixas.has(e.id)
          const marcada = selecionadas.includes(e.id)
          const limite = e.armazenamento_limite ?? 0
          const usado = e.consumoEmpresa ?? 0
          const pct = limite > 0 ? Math.min((usado / limite) * 100, 100) : 0

          return (
            <label
              key={e.id}
              className={cn('docs-empresa-item', marcada && 'docs-empresa-item--ativa', fixa && 'docs-empresa-item--fixa')}
            >
              <input
                type="checkbox"
                checked={marcada}
                disabled={fixa}
                onChange={() => alternar(e.id)}
              />
              <span className="docs-empresa-nome">{e.nome_fantasia}</span>
              {limite > 0 && (
                <span className="docs-empresa-uso">
                  {formatarBytes(usado)} / {formatarBytes(limite)}
                  <span className="docs-empresa-barra" aria-hidden>
                    <span style={{ width: `${pct}%` }} />
                  </span>
                </span>
              )}
            </label>
          )
        })}
      </div>

      {selecionadas.length === 0 && (
        <p className="docs-empresas-aviso">Selecione ao menos uma empresa.</p>
      )}
    </div>
  )
}
