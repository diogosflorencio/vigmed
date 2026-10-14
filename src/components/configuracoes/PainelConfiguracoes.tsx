'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel, CartaoPainel } from '@/components/layout/SecaoPainel'
import { Botao } from '@/components/vig/Botao'
import { Campo } from '@/components/vig/Campo'
import { AreaTexto } from '@/components/vig/AreaTexto'
import { CheckboxInline } from '@/components/vig/Checkbox'
import { useAcaoPendente } from '@/hooks/use-acao-pendente'
import {
  salvarConfiguracoesSistema,
  executarRetencaoDocumentos,
  simularRetencaoConfiguracao,
  enviarEmailTeste,
  type ConfiguracaoLinha,
} from '@/lib/configuracoes/acoes'

interface Props {
  configuracoes: ConfiguracaoLinha[]
}

function lerValor(configs: ConfiguracaoLinha[], chave: string): unknown {
  return configs.find((c) => c.chave === chave)?.valor
}

function limiarPadraoMb(configs: ConfiguracaoLinha[]): number {
  const v = lerValor(configs, 'armazenamento_limite_padrao_mb')
  if (typeof v === 'number') return v
  if (v && typeof v === 'object' && 'mb' in v) return Number((v as { mb: number }).mb) || 5120
  return 5120
}

function uploadPadraoMb(configs: ConfiguracaoLinha[]): number {
  const v = lerValor(configs, 'tamanho_max_upload')
  const bytes = typeof v === 'string' ? Number(v) : Number(v)
  if (!Number.isFinite(bytes) || bytes <= 0) return 100
  return Math.round((bytes / (1024 * 1024)) * 100) / 100
}

function extensoesPadrao(configs: ConfiguracaoLinha[]): string {
  const v = lerValor(configs, 'extensoes_permitidas')
  if (Array.isArray(v)) return v.join(', ')
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v) as unknown
      if (Array.isArray(parsed)) return parsed.join(', ')
    } catch {
      return v
    }
  }
  return 'pdf, doc, docx, xls, xlsx, ppt, pptx, jpg, jpeg, png, gif, webp, zip, rar, txt, csv'
}

function diasPadrao(configs: ConfiguracaoLinha[]): number {
  const v = lerValor(configs, 'dias_retencao')
  const n = typeof v === 'string' ? Number(v) : Number(v)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function emailPadrao(configs: ConfiguracaoLinha[]): boolean {
  const v = lerValor(configs, 'email_comunicado_automatico')
  if (typeof v === 'boolean') return v
  if (v === 'true' || v === true) return true
  return false
}

function legendaMb(mb: number): string {
  if (!Number.isFinite(mb) || mb <= 0) return 'Digite um valor em MB'
  const mbFmt = parseFloat(mb.toFixed(mb < 10 ? 2 : mb % 1 === 0 ? 0 : 1))
  if (mb < 1024) return `${mbFmt} MB`
  const gb = mb / 1024
  const gbFmt = parseFloat(gb.toFixed(gb < 10 ? 2 : 1))
  return `${mbFmt} MB = ${gbFmt} GB`
}

export function PainelConfiguracoes({ configuracoes }: Props) {
  const router = useRouter()
  const { pendente, executar } = useAcaoPendente<'salvar' | 'retencao' | 'emailTeste'>()

  const [limiteMb, definirLimiteMb] = useState(() => String(limiarPadraoMb(configuracoes)))
  const [uploadMb, definirUploadMb] = useState(() => String(uploadPadraoMb(configuracoes)))
  const [extensoes, definirExtensoes] = useState(() => extensoesPadrao(configuracoes))
  const [diasRetencao, definirDiasRetencao] = useState(() => String(diasPadrao(configuracoes)))
  const [emailAuto, definirEmailAuto] = useState(() => emailPadrao(configuracoes))
  const [emailTeste, definirEmailTeste] = useState('')
  const [retencaoSimulada, definirRetencaoSimulada] = useState<number | null>(null)

  const legendaLimite = useMemo(() => legendaMb(Number(limiteMb)), [limiteMb])
  const legendaUpload = useMemo(() => legendaMb(Number(uploadMb)), [uploadMb])

  useEffect(() => {
    const dias = Number(diasRetencao)
    if (!Number.isFinite(dias) || dias <= 0) {
      definirRetencaoSimulada(null)
      return
    }
    let ativo = true
    void simularRetencaoConfiguracao().then((r) => {
      if (ativo) definirRetencaoSimulada(r.candidatos)
    })
    return () => {
      ativo = false
    }
  }, [diasRetencao])

  function executarRetencao() {
    void executar('retencao', async () => {
      const resultado = await executarRetencaoDocumentos()
      if ('erro' in resultado && resultado.erro) {
        toast.error(String(resultado.erro))
        return
      }
      toast.success(
        resultado.excluidos > 0
          ? `${resultado.excluidos} documento(s) removido(s) pela política de retenção.`
          : 'Nenhum documento elegível para remoção no momento.',
      )
      router.refresh()
    })
  }

  function enviarTesteEmail() {
    void executar('emailTeste', async () => {
      const resultado = await enviarEmailTeste(emailTeste)
      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      toast.success(`E-mail de teste enviado para ${emailTeste.trim()}.`)
    })
  }

  function salvar() {
    void executar('salvar', async () => {
      const listaExt = extensoes
        .split(/[,;\s]+/)
        .map((e) => e.trim())
        .filter(Boolean)

      const resultado = await salvarConfiguracoesSistema({
        limitePadraoMb: Number(limiteMb),
        tamanhoMaxUploadMb: Number(uploadMb),
        extensoes: listaExt,
        diasRetencao: Number(diasRetencao),
        emailComunicadoAutomatico: emailAuto,
      })

      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      toast.success('Configurações salvas.')
      router.refresh()
    })
  }

  return (
    <SecaoPainel>
      <CabecalhoPagina
        rotulo="Sistema"
        titulo="Configurações"
        descricao="Parâmetros globais da plataforma. Alterações valem para novas ações (upload, empresas novas, comunicados)."
        acoes={
          <Botao variante="primario" tamanho="sm" carregando={pendente('salvar')} onClick={salvar} filho="Salvar alterações" />
        }
      />

      <CartaoPainel
        titulo="Armazenamento padrão por empresa"
        descricao="Cota inicial aplicada automaticamente ao cadastrar uma empresa nova. Empresas já existentes não mudam sozinhas; edite a cota na ficha da empresa se precisar."
      >
        <div className="flex flex-col sm:flex-row gap-3 items-end max-w-lg">
          <Campo
            rotulo="Limite padrão (MB)"
            type="number"
            min={1}
            step={1}
            value={limiteMb}
            onChange={(e) => definirLimiteMb(e.target.value)}
            hint={legendaLimite}
          />
        </div>
      </CartaoPainel>

      <CartaoPainel
        titulo="Upload de arquivos"
        descricao="Regras aplicadas no envio de documentos (admin e empresas)."
      >
        <div className="grid gap-4 max-w-2xl">
          <Campo
            rotulo="Tamanho máximo por arquivo (MB)"
            type="number"
            min={0.1}
            step={0.1}
            value={uploadMb}
            onChange={(e) => definirUploadMb(e.target.value)}
            hint={legendaUpload}
          />

          <AreaTexto
            rotulo="Extensões permitidas"
            rows={3}
            value={extensoes}
            onChange={(e) => definirExtensoes(e.target.value)}
            placeholder="pdf, docx, xlsx, png..."
            hint="Separe por vírgula. Sem ponto (use pdf, não .pdf). Só esses tipos podem ser enviados."
          />
        </div>
      </CartaoPainel>

      <CartaoPainel
        titulo="Retenção de documentos"
        descricao="Documentos sem validade manual recebem prazo automático no upload. A remoção ocorre quando a validade expira ou quando passam os dias configurados desde o envio."
      >
        <div className="max-w-lg grid gap-4">
          <Campo
            rotulo="Dias de retenção"
            type="number"
            min={0}
            step={1}
            value={diasRetencao}
            onChange={(e) => definirDiasRetencao(e.target.value)}
            hint="0 = sem prazo automático no upload. Com valor > 0, novos arquivos ganham valido_ate; arquivos antigos sem data também entram na política."
          />
          {retencaoSimulada != null && retencaoSimulada > 0 && (
            <p className="text-sm text-(--color-text-2)">
              <strong>{retencaoSimulada}</strong> documento{retencaoSimulada > 1 ? 's' : ''} seria
              {retencaoSimulada > 1 ? 'm' : ''} removido{retencaoSimulada > 1 ? 's' : ''} se executar a retenção agora.
            </p>
          )}
          <div className="flex flex-wrap gap-2 items-center">
            <Botao
              variante="secundario"
              tamanho="sm"
              carregando={pendente('retencao')}
              onClick={executarRetencao}
              filho="Executar retenção agora"
            />
            <span className="text-xs text-(--color-text-3)">
              Crons: GET https://api.vigmed.com.br/api/cron/retencao e GET https://api.vigmed.com.br/api/cron/alertas-validade (Bearer CRON_SECRET) 
            </span>
          </div>
        </div>
      </CartaoPainel>

      <CartaoPainel
        titulo="Comunicados"
        descricao="Avisos enviados às empresas pelo portal Docs."
      >
        <CheckboxInline
          rotulo="E-mail automático ao publicar comunicado"
          descricao="Quando ativo, envia e-mail às empresas ao publicar. Precisa da api do resend e o email do remetente"
          checked={emailAuto}
          onChange={(e) => definirEmailAuto(e.target.checked)}
          className="max-w-xl"
        />
      </CartaoPainel>

      <CartaoPainel
        titulo="E-mail (Resend)"
        descricao="Valide a configuração antes de depender dos envios automáticos."
      >
        <div className="flex flex-col sm:flex-row gap-3 items-end max-w-xl">
          <Campo
            rotulo="Enviar teste para"
            type="email"
            value={emailTeste}
            onChange={(e) => definirEmailTeste(e.target.value)}
            placeholder="seu@email.com"
            hint="Precisa da api do resend e o email do remetente. Não altera as configurações acima."
          />
          <Botao
            variante="secundario"
            tamanho="sm"
            carregando={pendente('emailTeste')}
            disabled={!emailTeste.trim()}
            onClick={enviarTesteEmail}
            filho="Enviar teste"
          />
        </div>
      </CartaoPainel>
    </SecaoPainel>
  )
}
