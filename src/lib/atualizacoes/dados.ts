export interface RegistroAtualizacao {
  versao: string
  data: string
  itens: string[]
}

/** Histórico de versões (jun–jul/2026, 0.0.1 → 1.1.0) */
export const ATUALIZACOES_VIGMED: RegistroAtualizacao[] = [
  {
    versao: '0.0.1',
    data: '09 jun 2026',
    itens: ['Projeto Next.js 15', 'Schema Supabase inicial', 'Migrations RLS'],
  },
  {
    versao: '0.0.2',
    data: '09 jun 2026',
    itens: ['Login admin e-mail/senha', 'Sessão com cookies SSR', 'Redirect pós-auth'],
  },
  {
    versao: '0.0.3',
    data: '09 jun 2026',
    itens: ['OAuth Google', 'Callback /api/auth/callback', 'Vínculo perfil ↔ auth (mas sem funcionar nenhum pouco)'],
  },
  {
    versao: '0.0.4',
    data: '10 jun 2026',
    itens: ['Roteamento por subdomínio', 'adm / docs / site / blog', 'VIGMED_DEV_TENANT local'],
  },
  {
    versao: '0.0.5',
    data: '10 jun 2026',
    itens: ['Políticas RLS por empresa', 'Papéis super_admin e admin', 'Service role no servidor'],
  },
  {
    versao: '0.0.6',
    data: '11 jun 2026',
    itens: ['CRUD empresas', 'Status ativa/inativa/suspensa', 'Limite de armazenamento'],
  },
  {
    versao: '0.0.7',
    data: '13 jun 2026',
    itens: ['Gestão de usuários admin', 'Papéis por ambiente', 'Busca e filtros'],
  },
  {
    versao: '0.0.8',
    data: '13 jun 2026',
    itens: ['Convites por e-mail', 'Token de aceite', 'Expiração de convite'],
  },
  {
    versao: '0.0.9',
    data: '15 jun 2026',
    itens: ['Portal docs (empresas)', 'Login e cadastro docs', 'Painel da empresa'],
  },
  {
    versao: '0.1.0',
    data: '15 jun 2026',
    itens: ['Upload R2 presign', 'Metadados no Postgres', 'Hash e tamanho do arquivo'],
  },
  {
    versao: '0.1.1',
    data: '17 jun 2026',
    itens: ['Download presign', 'Contador de downloads', 'Auditoria de download'],
  },
  {
    versao: '0.1.2',
    data: '19 jun 2026',
    itens: ['Categorias de documentos', 'Filtro por categoria', 'Drag-and-drop upload'],
  },
  {
    versao: '0.1.3',
    data: '19 jun 2026',
    itens: ['Comunicados no mural', 'Publicação por empresa', 'Fixar no topo'],
  },
  {
    versao: '0.1.4',
    data: '22 jun 2026',
    itens: ['Confirmação de leitura', 'Contagem de leituras', 'Notificação visual'],
  },
  {
    versao: '0.1.5',
    data: '24 jun 2026',
    itens: ['Mensagens admin ↔ empresa', 'Conversas por thread', 'Lista de conversas'],
  },
  {
    versao: '0.2.0',
    data: '24 jun 2026',
    itens: ['Módulo de auditoria', 'Tabela de eventos', 'Filtro por tipo e data'],
  },
  {
    versao: '0.2.1',
    data: '27 jun 2026',
    itens: ['Log de logins', 'Log de envios', 'Contexto usuário e IP'],
  },
  {
    versao: '0.2.2',
    data: '29 jun 2026',
    itens: ['Página de relatórios', 'Resumo operacional', 'Exportação básica'],
  },
  {
    versao: '0.2.3',
    data: '29 jun 2026',
    itens: ['Perfil do usuário', 'Alterar nome e avatar', 'Preferências salvas no perfil'],
  },
  {
    versao: '0.3.0',
    data: '02 jul 2026',
    itens: ['Blog público /blog', 'SEO e sitemap', 'Posts por slug'],
  },
  {
    versao: '0.3.1',
    data: '05 jul 2026',
    itens: ['Editor TipTap no admin', 'Rascunho e publicado', 'Slug automático'],
  },
  {
    versao: '0.3.2',
    data: '05 jul 2026',
    itens: ['Imagens de capa no blog', 'Upload presign blog', 'Proxy de imagem'],
  },
  {
    versao: '0.3.3',
    data: '08 jul 2026',
    itens: ['Contador de visualizações', 'API visualizar post', 'Stats no painel blog'],
  },
  {
    versao: '0.4.0',
    data: '11 jul 2026',
    itens: ['Landing /site', 'Hero e seções', 'Links adm e docs'],
  },
  {
    versao: '0.4.1',
    data: '14 jul 2026',
    itens: ['Tema claro/escuro', 'Modo sistema', 'Toggle no dock'],
  },
  {
    versao: '0.4.2',
    data: '14 jul 2026',
    itens: ['Paletas vigmed/floresta/oceano/ardosia', 'Sync tema no Supabase', 'Script anti-flash'],
  },
  {
    versao: '0.5.0',
    data: '17 jul 2026',
    itens: ['Menu dock inferior', 'Ícones com pílula no hover', 'Shell sem header'],
  },
  {
    versao: '0.6.0',
    data: '19 jul 2026',
    itens: ['Painel estatísticas admin', 'Dados agregados Supabase', 'Layout duas colunas'],
  },
  {
    versao: '0.7.0',
    data: '22 jul 2026',
    itens: ['Gráficos em caracteres ASCII', 'Barras e sparklines', 'Fundo com malha animada'],
  },
  {
    versao: '1.0.0',
    data: '26 jul 2026',
    itens: ['Lançamento VIGMED', 'Tema isolado na landing', 'Configurações e polish geral'],
  },
  {
    versao: '1.0.1',
    data: '26 jul 2026',
    itens: [
      'Tema claro/escuro e paletas visuais no painel em produção',
      'Rotas /adm e /docs no domínio principal deixam de ser tratadas como site público',
    ],
  },
  {
    versao: '1.0.2',
    data: '26 jul 2026',
    itens: [
      'listagem e criação de convites via service role após validação de permissão',
      'E-mail de convite com magic link (sem pré-criar conta no auth)',
      'Google e /cadastro liberados para e-mail convidado',
      'Mais migration: trigger perfil ↔ convite',
      'Mensagens de erro reais ao criar convite',
    ],
  },
  {
    versao: '1.0.3',
    data: '26 jul 2026',
    itens: [
      'Login Google: cookies de sessão PKCE no redirect do callback',
      'Erros OAuth exibidos na tela de entrar',
    ],
  },
  {
    versao: '1.1.0',
    data: '26 jul 2026',
    itens: [
      'Apagar e inativar convites na página de usuários',
      'Inativar, reativar e excluir usuários cadastrados',
      'Confirmação antes de ações destrutivas',
    ],
  },
]

export const VERSAO_ATUAL = ATUALIZACOES_VIGMED[ATUALIZACOES_VIGMED.length - 1].versao
