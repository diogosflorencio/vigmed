'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel, CartaoPainel } from '@/components/layout/SecaoPainel'
import { Button, Input } from '@/components/ui'
import { salvarConfiguracao } from '@/lib/configuracoes/acoes'

interface ConfigItem {
  chave: string
  valor: Record<string, unknown>
}

interface Props {
  configuracoes: ConfigItem[]
}

export function PainelConfiguracoes({ configuracoes }: Props) {
  const router = useRouter()
  const [limiteMb, definirLimiteMb] = useState(() => {
    const cfg = configuracoes.find((c) => c.chave === 'armazenamento_limite_padrao_mb')
    return String((cfg?.valor as { mb?: number })?.mb ?? 5120)
  })
  const [pendente, iniciarTransicao] = useTransition()

  function salvar() {
    iniciarTransicao(async () => {
      const mb = parseInt(limiteMb, 10)
      if (isNaN(mb) || mb <= 0) {
        toast.error('Valor inválido.')
        return
      }
      const resultado = await salvarConfiguracao('armazenamento_limite_padrao_mb', { mb })
      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      toast.success('Configuração salva.')
      router.refresh()
    })
  }

  return (
    <SecaoPainel>
      <CabecalhoPagina
        titulo="Configurações"
        descricao="Parâmetros globais da plataforma VIGMED."
      />

      <CartaoPainel titulo="Armazenamento" descricao="Limite padrão para novas empresas (MB)">
        <div className="flex flex-col sm:flex-row gap-3 items-end max-w-md">
          <Input label="Limite (MB)" type="number" value={limiteMb} onChange={(e) => definirLimiteMb(e.target.value)} />
          <Button variant="primary" loading={pendente} onClick={salvar}>Salvar</Button>
        </div>
      </CartaoPainel>

      <CartaoPainel titulo="Outras configurações">
        <p className="text-sm text-muted-foreground">
          Configurações adicionais podem ser gerenciadas diretamente na tabela <code>configuracoes</code> do Supabase.
        </p>
        {configuracoes.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm font-mono">
            {configuracoes.map((c) => (
              <li key={c.chave} className="flex justify-between border-b border-border/50 py-2">
                <span>{c.chave}</span>
                <span className="text-muted-foreground truncate max-w-[200px]">{JSON.stringify(c.valor)}</span>
              </li>
            ))}
          </ul>
        )}
      </CartaoPainel>
    </SecaoPainel>
  )
}
