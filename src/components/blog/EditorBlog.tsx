'use client'

import { useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Underline as UnderlineIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface PropsEditorBlog {
  conteudo: string
  onChange: (html: string) => void
  postId?: string
  onPostId?: (id: string) => void
  className?: string
}

async function enviarImagem(arquivo: File, postId?: string): Promise<{ url: string; postId: string } | null> {
  const resposta = await fetch('/api/upload/presign-blog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nomeArquivo: arquivo.name,
      tipoMime: arquivo.type,
      tamanho: arquivo.size,
      postId,
    }),
  })
  if (!resposta.ok) {
    toast.error('Falha ao preparar upload da imagem.')
    return null
  }
  const { urlUpload, urlExibicao, chaveArquivo, postId: novoId } = await resposta.json()
  const put = await fetch(urlUpload, {
    method: 'PUT',
    headers: { 'Content-Type': arquivo.type },
    body: arquivo,
  })
  if (!put.ok) {
    toast.error('Falha ao enviar imagem.')
    return null
  }
  return { url: urlExibicao ?? `/api/blog/imagem?chave=${encodeURIComponent(chaveArquivo)}`, postId: novoId }
}

/** Editor rich text para posts do blog (TipTap) */
export function EditorBlog({ conteudo, onChange, postId, onPostId, className }: PropsEditorBlog) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-xl max-w-full h-auto my-4' } }),
      Placeholder.configure({ placeholder: 'Escreva o conteúdo do artigo…' }),
    ],
    content: conteudo,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'blog-editor-prose min-h-[320px] px-4 py-3 outline-none',
      },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  })

  const inserirImagem = useCallback(
    async (arquivo: File) => {
      const resultado = await enviarImagem(arquivo, postId)
      if (!resultado) return
      if (onPostId && resultado.postId !== postId) onPostId(resultado.postId)
      editor?.chain().focus().setImage({ src: resultado.url, alt: arquivo.name }).run()
    },
    [editor, postId, onPostId],
  )

  useEffect(() => {
    if (!editor) return
    const aoDrop = (event: DragEvent) => {
      const arquivo = event.dataTransfer?.files?.[0]
      if (!arquivo?.type.startsWith('image/')) return
      event.preventDefault()
      void inserirImagem(arquivo)
    }
    const aoPaste = (event: ClipboardEvent) => {
      const arquivo = event.clipboardData?.files?.[0]
      if (!arquivo?.type.startsWith('image/')) return
      event.preventDefault()
      void inserirImagem(arquivo)
    }
    const el = editor.view.dom
    el.addEventListener('drop', aoDrop)
    el.addEventListener('paste', aoPaste)
    return () => {
      el.removeEventListener('drop', aoDrop)
      el.removeEventListener('paste', aoPaste)
    }
  }, [editor, inserirImagem])

  useEffect(() => {
    if (editor && conteudo !== editor.getHTML()) {
      editor.commands.setContent(conteudo, { emitUpdate: false })
    }
  }, [conteudo, editor])

  function adicionarLink() {
    const url = window.prompt('URL do link:')
    if (!url) return
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  function escolherImagem() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const arquivo = input.files?.[0]
      if (arquivo) void inserirImagem(arquivo)
    }
    input.click()
  }

  if (!editor) return null

  return (
    <div className={cn('surface-card overflow-hidden flex flex-col', className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--glass-border)] p-2">
        <BotaoBarra ativo={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} titulo="Negrito">
          <Bold size={16} />
        </BotaoBarra>
        <BotaoBarra ativo={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} titulo="Itálico">
          <Italic size={16} />
        </BotaoBarra>
        <BotaoBarra ativo={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} titulo="Sublinhado">
          <UnderlineIcon size={16} />
        </BotaoBarra>
        <span className="w-px h-6 bg-[var(--glass-border)] mx-1" />
        <BotaoBarra ativo={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} titulo="Título H2">
          <Heading2 size={16} />
        </BotaoBarra>
        <BotaoBarra ativo={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} titulo="Título H3">
          <Heading3 size={16} />
        </BotaoBarra>
        <span className="w-px h-6 bg-[var(--glass-border)] mx-1" />
        <BotaoBarra ativo={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} titulo="Lista">
          <List size={16} />
        </BotaoBarra>
        <BotaoBarra ativo={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} titulo="Lista numerada">
          <ListOrdered size={16} />
        </BotaoBarra>
        <BotaoBarra ativo={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} titulo="Citação">
          <Quote size={16} />
        </BotaoBarra>
        <span className="w-px h-6 bg-[var(--glass-border)] mx-1" />
        <BotaoBarra ativo={editor.isActive('link')} onClick={adicionarLink} titulo="Link">
          <Link2 size={16} />
        </BotaoBarra>
        <BotaoBarra onClick={escolherImagem} titulo="Inserir imagem">
          <ImagePlus size={16} />
        </BotaoBarra>
      </div>
      <EditorContent editor={editor} className="flex-1" />
    </div>
  )
}

function BotaoBarra({
  children,
  onClick,
  ativo,
  titulo,
}: {
  children: React.ReactNode
  onClick: () => void
  ativo?: boolean
  titulo: string
}) {
  return (
    <button
      type="button"
      title={titulo}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
        ativo
          ? 'bg-[var(--glass-nav-active)] text-[var(--color-text-1)]'
          : 'text-[var(--color-text-2)] hover:bg-[var(--glass-nav-hover)]',
      )}
    >
      {children}
    </button>
  )
}
