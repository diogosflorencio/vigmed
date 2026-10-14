'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { EditorBlog } from '@/components/blog/EditorBlog'
import { CabecalhoPagina } from '@/components/layout/CabecalhoPagina'
import { SecaoPainel } from '@/components/layout/SecaoPainel'
import { Botao } from '@/components/vig/Botao'
import { Campo } from '@/components/vig/Campo'
import { AreaTexto } from '@/components/vig/AreaTexto'
import { Seletor } from '@/components/vig/Seletor'
import { Cartao } from '@/components/vig/Cartao'
import { criarPostBlog, atualizarPostBlog } from '@/lib/blog/acoes'
import { gerarSlug } from '@/lib/blog/gerar-slug'
import { ROTAS, hrefPublico } from '@/lib/rotas'
import { obterUrlBaseDoAmbiente } from '@/lib/ambiente'
import type { PostBlog } from '@/types'
import type { StatusPostBlog } from '@/lib/blog/tipos'

interface Props {
  post?: PostBlog | null
}

export function FormularioPostBlog({ post }: Props) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const editando = Boolean(post?.id)

  const [postId, definirPostId] = useState(post?.id ?? '')
  const [titulo, definirTitulo] = useState(post?.titulo ?? '')
  const [slug, definirSlug] = useState(post?.slug ?? '')
  const [resumo, definirResumo] = useState(post?.resumo ?? '')
  const [corpoHtml, definirCorpoHtml] = useState(post?.corpo_html ?? '')
  const [metaTitulo, definirMetaTitulo] = useState(post?.meta_titulo ?? '')
  const [metaDescricao, definirMetaDescricao] = useState(post?.meta_descricao ?? '')
  const [tagsTexto, definirTagsTexto] = useState((post?.tags ?? []).join(', '))
  const [imagemCapaUrl, definirImagemCapaUrl] = useState(post?.imagem_capa_url ?? '')
  const [imagemCapaChave, definirImagemCapaChave] = useState(post?.imagem_capa_chave ?? '')
  const [status, definirStatus] = useState<StatusPostBlog>(post?.status ?? 'rascunho')

  const slugPreview = slug.trim() || gerarSlug(titulo)
  const urlBlog = `${obterUrlBaseDoAmbiente('blog')}${ROTAS.blog.post(slugPreview)}`

  async function enviarCapa(arquivo: File) {
    const resposta = await fetch('/api/upload/presign-blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nomeArquivo: arquivo.name,
        tipoMime: arquivo.type,
        tamanho: arquivo.size,
        postId: postId || undefined,
      }),
    })
    if (!resposta.ok) {
      toast.error('Erro ao preparar capa.')
      return
    }
    const dados = await resposta.json()
    const put = await fetch(dados.urlUpload, {
      method: 'PUT',
      headers: { 'Content-Type': arquivo.type },
      body: arquivo,
    })
    if (!put.ok) {
      toast.error('Erro ao enviar capa.')
      return
    }
    if (!postId && dados.postId) definirPostId(dados.postId)
    definirImagemCapaUrl(dados.urlExibicao)
    definirImagemCapaChave(dados.chaveArquivo)
    toast.success('Capa enviada.')
  }

  function salvar(publicar: boolean) {
    if (!titulo.trim()) {
      toast.error('Informe o título.')
      return
    }
    if (!corpoHtml.trim() || corpoHtml === '<p></p>') {
      toast.error('Escreva o conteúdo do post.')
      return
    }

    const tags = tagsTexto
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      titulo,
      slug: slug || gerarSlug(titulo),
      resumo,
      corpoHtml,
      imagemCapaUrl: imagemCapaUrl || null,
      imagemCapaChave: imagemCapaChave || null,
      metaTitulo: metaTitulo || titulo,
      metaDescricao: metaDescricao || resumo,
      tags,
      status: publicar ? ('publicado' as const) : status,
      publicar,
    }

    iniciar(async () => {
      const resultado = editando
        ? await atualizarPostBlog(post!.id, payload)
        : await criarPostBlog(payload)

      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }

      toast.success(publicar ? 'Post publicado!' : 'Rascunho salvo.')
      if (!editando && 'id' in resultado && resultado.id) {
        router.push(hrefPublico(ROTAS.adm.blogEditar(resultado.id)))
      } else {
        router.refresh()
      }
    })
  }

  return (
    <SecaoPainel className="max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <Link href={hrefPublico(ROTAS.adm.blog)} className="btn-icon-glass">
            <ArrowLeft size={16} />
          </Link>
          <CabecalhoPagina
            rotulo="Blog"
            titulo={editando ? 'Editar post' : 'Novo post'}
            descricao="Redija, adicione imagens e publique no blog público."
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Botao variante="secundario" disabled={pendente} onClick={() => salvar(false)}>
            Salvar rascunho
          </Botao>
          <Botao disabled={pendente} carregando={pendente} onClick={() => salvar(true)}>
            Publicar
          </Botao>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Campo
            rotulo="Título"
            value={titulo}
            onChange={(e) => {
              definirTitulo(e.target.value)
              if (!slug || slug === gerarSlug(titulo)) definirSlug(gerarSlug(e.target.value))
            }}
            placeholder="Título do artigo"
          />

          <EditorBlog
            conteudo={corpoHtml}
            onChange={definirCorpoHtml}
            postId={postId || undefined}
            onPostId={definirPostId}
          />
        </div>

        <aside className="space-y-4">
          <Cartao titulo="Publicação" className="!p-4 space-y-3">
            <Campo
              rotulo="Slug (URL)"
              value={slug}
              onChange={(e) => definirSlug(gerarSlug(e.target.value))}
            />
            <a
              href={urlBlog}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[var(--vig-teal)] hover:underline -mt-1"
            >
              {slugPreview}
              <ExternalLink size={12} />
            </a>
            <Seletor
              rotulo="Status"
              value={status}
              onChange={(e) => definirStatus(e.target.value as StatusPostBlog)}
              opcoes={[
                { valor: 'rascunho', rotulo: 'Rascunho' },
                { valor: 'publicado', rotulo: 'Publicado' },
                { valor: 'arquivado', rotulo: 'Arquivado' },
              ]}
            />
          </Cartao>

          <Cartao titulo="SEO" className="!p-4 space-y-3">
            <Campo
              rotulo="Meta título"
              value={metaTitulo}
              onChange={(e) => definirMetaTitulo(e.target.value)}
              placeholder={titulo || 'Título para Google'}
            />
            <AreaTexto
              rotulo="Meta descrição"
              value={metaDescricao}
              onChange={(e) => definirMetaDescricao(e.target.value)}
              rows={3}
              placeholder="Resumo para resultados de busca"
            />
            <Campo
              rotulo="Tags (vírgula)"
              value={tagsTexto}
              onChange={(e) => definirTagsTexto(e.target.value)}
              placeholder="saúde, documentos, compliance"
            />
          </Cartao>

          <Cartao titulo="Capa" descricao="Imagem de destaque e compartilhamento social." className="!p-4 space-y-3">
            {imagemCapaUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagemCapaUrl} alt="Capa" className="w-full rounded-xl object-cover max-h-40" />
            )}
            <Botao
              type="button"
              variante="secundario"
              className="w-full"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = () => {
                  const arq = input.files?.[0]
                  if (arq) void enviarCapa(arq)
                }
                input.click()
              }}
            >
              {imagemCapaUrl ? 'Trocar capa' : 'Enviar capa'}
            </Botao>
          </Cartao>

          <Cartao className="!p-4">
            <AreaTexto
              rotulo="Resumo"
              value={resumo}
              onChange={(e) => definirResumo(e.target.value)}
              rows={4}
              placeholder="Breve descrição exibida na listagem"
            />
          </Cartao>
        </aside>
      </div>
    </SecaoPainel>
  )
}
