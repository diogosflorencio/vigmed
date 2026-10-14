'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Underline as UnderlineIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  conteudo: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minHeight?: number
}

/** Editor rich text para comunicados (TipTap, estilo Word) */
export function EditorComunicado({
  conteudo,
  onChange,
  placeholder = 'Escreva o conteúdo do comunicado...',
  className,
  minHeight = 180,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: conteudo,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'blog-editor-prose px-3 py-2.5 outline-none',
        style: `min-height: ${minHeight}px`,
      },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  })

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

  if (!editor) return null

  return (
    <div className={cn('com-editor-shell', className)}>
      <div className="com-editor-barra">
        <BotaoBarra ativo={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} titulo="Negrito">
          <Bold size={15} />
        </BotaoBarra>
        <BotaoBarra ativo={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} titulo="Itálico">
          <Italic size={15} />
        </BotaoBarra>
        <BotaoBarra ativo={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} titulo="Sublinhado">
          <UnderlineIcon size={15} />
        </BotaoBarra>
        <span className="com-editor-sep" />
        <BotaoBarra ativo={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} titulo="Título">
          <Heading2 size={15} />
        </BotaoBarra>
        <BotaoBarra ativo={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} titulo="Subtítulo">
          <Heading3 size={15} />
        </BotaoBarra>
        <span className="com-editor-sep" />
        <BotaoBarra ativo={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} titulo="Lista">
          <List size={15} />
        </BotaoBarra>
        <BotaoBarra ativo={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} titulo="Lista numerada">
          <ListOrdered size={15} />
        </BotaoBarra>
        <BotaoBarra ativo={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} titulo="Citação">
          <Quote size={15} />
        </BotaoBarra>
        <span className="com-editor-sep" />
        <BotaoBarra ativo={editor.isActive('link')} onClick={adicionarLink} titulo="Link">
          <Link2 size={15} />
        </BotaoBarra>
      </div>
      <EditorContent editor={editor} />
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
      className={cn('com-editor-btn', ativo && 'com-editor-btn--ativo')}
    >
      {children}
    </button>
  )
}

export function textoPlanoHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}
