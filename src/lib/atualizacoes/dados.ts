export interface RegistroAtualizacao {
  versao: string
  data: string
  itens: string[]
}

/** Histórico de versões — jun/2026, 0.0.1 → 1.0.0 */
export const ATUALIZACOES_VIGMED: RegistroAtualizacao[] = [
  {
    versao: '0.0.1',
    data: '01 jun 2026',
    itens: ['Projeto Next.js 15', 'Schema Supabase inicial', 'Migrations RLS'],
  },
  {
    versao: '0.0.2',
    data: '02 jun 2026',
    itens: ['Login admin e-mail/senha', 'Sessão com cookies SSR', 'Redirect pós-auth'],
  },
  {
    versao: '0.0.3',
    data: '03 jun 2026',
    itens: ['OAuth Google', 'Callback /api/auth/callback', 'Vínculo perfil ↔ auth'],
  },
  {
    versao: '0.0.4',
    data: '04 jun 2026',
    itens: ['Roteamento por subdomínio', 'adm / docs / site / blog', 'VIGMED_DEV_TENANT local'],
  },
  {
    versao: '0.0.5',
    data: '05 jun 2026',
    itens: ['Políticas RLS por empresa', 'Papéis super_admin e admin', 'Service role no servidor'],
  },
  {
    versao: '0.0.6',
    data: '06 jun 2026',
    itens: ['CRUD empresas', 'Status ativa/inativa/suspensa', 'Limite de armazenamento'],
  },
  {
    versao: '0.0.7',
    data: '07 jun 2026',
    itens: ['Gestão de usuários admin', 'Papéis por ambiente', 'Busca e filtros'],
  },
  {
    versao: '0.0.8',
    data: '08 jun 2026',
    itens: ['Convites por e-mail', 'Token de aceite', 'Expiração de convite'],
  },
  {
    versao: '0.0.9',
    data: '09 jun 2026',
    itens: ['Portal docs (empresas)', 'Login e cadastro docs', 'Painel da empresa'],
  },
  {
    versao: '0.1.0',
    data: '10 jun 2026',
    itens: ['Upload R2 presign', 'Metadados no Postgres', 'Hash e tamanho do arquivo'],
  },
  {
    versao: '0.1.1',
    data: '11 jun 2026',
    itens: ['Download presign', 'Contador de downloads', 'Auditoria de download'],
  },
  {
    versao: '0.1.2',
    data: '12 jun 2026',
    itens: ['Categorias de documentos', 'Filtro por categoria', 'Drag-and-drop upload'],
  },
  {
    versao: '0.1.3',
    data: '13 jun 2026',
    itens: ['Comunicados no mural', 'Publicação por empresa', 'Fixar no topo'],
  },
  {
    versao: '0.1.4',
    data: '14 jun 2026',
    itens: ['Confirmação de leitura', 'Contagem de leituras', 'Notificação visual'],
  },
  {
    versao: '0.1.5',
    data: '15 jun 2026',
    itens: ['Mensagens admin ↔ empresa', 'Conversas por thread', 'Lista de conversas'],
  },
  {
    versao: '0.2.0',
    data: '16 jun 2026',
    itens: ['Módulo de auditoria', 'Tabela de eventos', 'Filtro por tipo e data'],
  },
  {
    versao: '0.2.1',
    data: '17 jun 2026',
    itens: ['Log de logins', 'Log de envios', 'Contexto usuário e IP'],
  },
  {
    versao: '0.2.2',
    data: '18 jun 2026',
    itens: ['Página de relatórios', 'Resumo operacional', 'Exportação básica'],
  },
  {
    versao: '0.2.3',
    data: '19 jun 2026',
    itens: ['Perfil do usuário', 'Alterar nome e avatar', 'Preferências salvas no perfil'],
  },
  {
    versao: '0.3.0',
    data: '20 jun 2026',
    itens: ['Blog público /blog', 'SEO e sitemap', 'Posts por slug'],
  },
  {
    versao: '0.3.1',
    data: '21 jun 2026',
    itens: ['Editor TipTap no admin', 'Rascunho e publicado', 'Slug automático'],
  },
  {
    versao: '0.3.2',
    data: '22 jun 2026',
    itens: ['Imagens de capa no blog', 'Upload presign blog', 'Proxy de imagem'],
  },
  {
    versao: '0.3.3',
    data: '23 jun 2026',
    itens: ['Contador de visualizações', 'API visualizar post', 'Stats no painel blog'],
  },
  {
    versao: '0.4.0',
    data: '24 jun 2026',
    itens: ['Landing /site', 'Hero e seções', 'Links adm e docs'],
  },
  {
    versao: '0.4.1',
    data: '25 jun 2026',
    itens: ['Tema claro/escuro', 'Modo sistema', 'Toggle no dock'],
  },
  {
    versao: '0.4.2',
    data: '26 jun 2026',
    itens: ['Paletas vigmed/floresta/oceano/ardosia', 'Sync tema no Supabase', 'Script anti-flash'],
  },
  {
    versao: '0.5.0',
    data: '27 jun 2026',
    itens: ['Menu dock inferior', 'Ícones com pílula no hover', 'Shell sem header'],
  },
  {
    versao: '0.6.0',
    data: '28 jun 2026',
    itens: ['Painel estatísticas admin', 'Dados agregados Supabase', 'Layout duas colunas'],
  },
  {
    versao: '0.7.0',
    data: '29 jun 2026',
    itens: ['Gráficos em caracteres ASCII', 'Barras e sparklines', 'Fundo com malha animada'],
  },
  {
    versao: '1.0.0',
    data: '30 jun 2026',
    itens: ['Lançamento VIGMED', 'Tema isolado na landing', 'Configurações e polish geral'],
  },
]

export const VERSAO_ATUAL = ATUALIZACOES_VIGMED[ATUALIZACOES_VIGMED.length - 1].versao
