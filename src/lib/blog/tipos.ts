export type StatusPostBlog = 'rascunho' | 'publicado' | 'arquivado'

export interface PostBlog {
  id: string
  criado_em: string
  atualizado_em: string
  titulo: string
  slug: string
  resumo: string | null
  corpo_html: string
  imagem_capa_url: string | null
  imagem_capa_chave: string | null
  meta_titulo: string | null
  meta_descricao: string | null
  tags: string[]
  status: StatusPostBlog
  publicado_em: string | null
  autor_id: string | null
  total_visualizacoes: number
  metadados: Record<string, unknown>
}

export interface EstatisticasPostBlog {
  postId: string
  totalVisualizacoes: number
  visualizacoes7d: number
  visualizacoes30d: number
  ultimaVisualizacao: string | null
}

export interface DadosSalvarPostBlog {
  titulo: string
  slug?: string
  resumo?: string
  corpoHtml: string
  imagemCapaUrl?: string | null
  imagemCapaChave?: string | null
  metaTitulo?: string
  metaDescricao?: string
  tags?: string[]
  status: StatusPostBlog
  publicar?: boolean
}
