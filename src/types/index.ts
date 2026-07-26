export type PapelUsuario =
  | 'administrador'
  | 'administrador_empresa'
  | 'usuario_empresa'

export type StatusEmpresa = 'ativo' | 'inativo' | 'suspenso'

export type PrioridadeComunicado = 'baixa' | 'normal' | 'alta' | 'urgente'

export type AcaoAuditoria =
  | 'login' | 'logout' | 'envio' | 'download' | 'exclusao' | 'atualizacao'
  | 'criacao' | 'redefinicao_senha' | 'alteracao_permissao' | 'visualizacao_documento'
  | 'criacao_empresa' | 'atualizacao_empresa' | 'criacao_usuario' | 'atualizacao_usuario' | 'bloqueio_usuario'

export type AcaoDocumento = 'visualizacao' | 'download' | 'compartilhamento'

export interface Perfil {
  id: string
  criado_em: string
  atualizado_em: string
  email: string
  nome_completo: string
  url_avatar: string | null
  papel: PapelUsuario
  empresa_id: string | null
  ativo: boolean
  telefone: string | null
  ultimo_login_em: string | null
  metadados: Record<string, unknown>
  empresas?: Empresa | null
}

export interface Empresa {
  id: string
  criado_em: string
  atualizado_em: string
  razao_social: string
  nome_fantasia: string
  cnpj: string
  email: string
  telefone: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  responsavel: string | null
  observacoes: string | null
  status: StatusEmpresa
  armazenamento_usado: number
  armazenamento_limite: number
  metadados: Record<string, unknown>
}

export interface Categoria {
  id: string
  criado_em: string
  nome: string
  slug: string
  descricao: string | null
  cor: string | null
  padrao: boolean
  ordem: number
}

export interface Documento {
  id: string
  criado_em: string
  atualizado_em: string
  titulo: string
  descricao: string | null
  categoria_id: string | null
  chave_arquivo: string
  nome_arquivo: string
  tamanho_arquivo: number
  tipo_mime: string
  extensao: string | null
  tags: string[]
  valido_ate: string | null
  observacoes: string | null
  enviado_por: string | null
  total_downloads: number
  origem_publicacao?: 'admin' | 'empresa'
  ativo: boolean
  permitir_compartilhar: boolean
  metadados: Record<string, unknown>
  categorias?: Categoria | null
}

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
  status: 'rascunho' | 'publicado' | 'arquivado'
  publicado_em: string | null
  autor_id: string | null
  total_visualizacoes: number
  metadados: Record<string, unknown>
}

export interface Comunicado {
  id: string
  criado_em: string
  atualizado_em: string
  titulo: string
  corpo: string
  prioridade: PrioridadeComunicado
  fixado: boolean
  ativo: boolean
  publicado_em: string
  expira_em: string | null
  autor_id: string | null
  para_todos: boolean
  anexos: unknown[]
  metadados: Record<string, unknown>
}

export interface NomeArquivoAnalisado {
  empresa: string
  tipoDocumento: string
  nomeDocumento: string
  valido: boolean
  original: string
}

export interface Paginacao<T> {
  dados: T[]
  total: number
  pagina: number
  porPagina: number
  totalPaginas: number
}

export interface IndicadoresPainel {
  totalEmpresas: number
  usuariosAtivos: number
  totalDocumentos: number
  armazenamentoUsado: number
  uploadsRecentes: number
  downloadsRecentes: number
}

export interface EstatisticasPainelAdmin {
  empresas: {
    ativas: number
    inativas: number
    suspensas: number
    total: number
    armazenamentoUsado: number
    armazenamentoLimite: number
    armazenamentoVigmed: number
    armazenamentoEmpresas: number
    mediaArmazenamento: number
    maiorConsumo: { nome: string; bytes: number } | null
  }
  usuarios: {
    ativos: number
    inativos: number
    administradores: number
    administradoresEmpresa: number
    usuariosEmpresa: number
    loginsRecentes: number
  }
  documentos: {
    total: number
    ativos: number
    criados7d: number
    criados30d: number
    somaTamanho: number
    somaDownloads: number
    downloads7d: number
    uploads7d: number
    categorias: number
  }
  comunicados: {
    total: number
    ativos: number
    fixados: number
    leituras: number
  }
  mensagens: {
    conversasAtivas: number
    totalMensagens: number
    mensagens7d: number
  }
  blog: {
    publicados: number
    rascunhos: number
    arquivados: number
    visualizacoes7d: number
  }
  convites: {
    pendentes: number
    aceitos30d: number
  }
  auditoria: {
    eventos7d: number
    eventos24h: number
    logins7d: number
    envios7d: number
    downloads7d: number
  }
}

export interface IndicadoresEmpresa {
  documentosRecentes: number
  comunicadosNaoLidos: number
  mensagensNaoLidas: number
  armazenamentoUsado: number
  armazenamentoLimite: number
  ultimosDownloads: number
}
