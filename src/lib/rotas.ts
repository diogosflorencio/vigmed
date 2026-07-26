import type { AmbienteApp } from '@/lib/ambiente'

/** Rotas centralizadas - evita strings duplicadas entre páginas, nav e server actions */
export const ROTAS = {
  site: {
    home: '/site',
  },
  blog: {
    home: '/blog',
    post: (slug: string) => `/blog/${slug}`,
  },
  doc: {
    arquivo: (id: string) => `/doc/${id}`,
  },
  auth: {
    entrar: '/entrar',
    cadastro: '/cadastro',
    recuperar: '/recuperar',
  },
  adm: {
    entrar: '/entrar',
    cadastro: '/cadastro',
    recuperar: '/recuperar',
    painel: '/adm/painel',
    empresas: '/adm/empresas',
    usuarios: '/adm/usuarios',
    documentos: '/adm/documentos',
    comunicados: '/adm/comunicados',
    blog: '/adm/blog',
    blogNovo: '/adm/blog/novo',
    blogEditar: (id: string) => `/adm/blog/${id}/editar`,
    mensagens: '/adm/mensagens',
    relatorios: '/adm/relatorios',
    auditoria: '/adm/auditoria',
    configuracoes: '/adm/configuracoes',
    atualizacoes: '/adm/atualizacoes',
    perfil: '/adm/perfil',
  },
  docs: {
    entrar: '/entrar',
    cadastro: '/cadastro',
    recuperar: '/recuperar',
    painel: '/docs/painel',
    documentos: '/docs/documentos',
    comunicados: '/docs/comunicados',
    mensagens: '/docs/mensagens',
    usuarios: '/docs/usuarios',
    perfil: '/docs/perfil',
  },
} as const

const dominioRaiz = () => process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vigmed.com.br'

/** URL pública do blog (subdomínio) */
export function urlBlogPublico() {
  return process.env.NEXT_PUBLIC_BLOG_URL ?? `https://blog.${dominioRaiz()}`
}

export function rotasDoAmbiente(ambiente: AmbienteApp) {
  return ambiente === 'adm' ? ROTAS.adm : ROTAS.docs
}

export function caminhoEntrar() {
  return ROTAS.auth.entrar
}
