
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- -- Enums ------
do $$ begin
  create type public.papel_usuario as enum (
    'super_administrador',
    'administrador',
    'administrador_empresa',
    'usuario_empresa'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.status_empresa as enum ('ativo', 'inativo', 'suspenso');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.prioridade_comunicado as enum ('baixa', 'normal', 'alta', 'urgente');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.acao_auditoria as enum (
    'login', 'logout', 'envio', 'download', 'exclusao', 'atualizacao',
    'criacao', 'redefinicao_senha', 'alteracao_permissao', 'visualizacao_documento',
    'criacao_empresa', 'atualizacao_empresa', 'criacao_usuario', 'atualizacao_usuario', 'bloqueio_usuario'
  );
exception when duplicate_object then null;
end $$;

-- -- Perfis (extensão de auth.users) -----
create table if not exists public.perfis (
  id              uuid primary key references auth.users(id) on delete cascade,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now(),
  email           text not null,
  nome_completo   text not null default '',
  url_avatar      text,
  papel           public.papel_usuario not null default 'usuario_empresa',
  empresa_id      uuid,
  ativo           boolean not null default true,
  telefone        text,
  ultimo_login_em timestamptz,
  metadados       jsonb not null default '{}'::jsonb
);

create index if not exists idx_perfis_empresa on public.perfis (empresa_id);
create index if not exists idx_perfis_papel on public.perfis (papel);
create index if not exists idx_perfis_email on public.perfis (email);

-- -- Empresas ---
create table if not exists public.empresas (
  id                    uuid primary key default gen_random_uuid(),
  criado_em             timestamptz not null default now(),
  atualizado_em         timestamptz not null default now(),
  razao_social          text not null,
  nome_fantasia         text not null,
  cnpj                  text not null unique,
  email                 text not null,
  telefone              text,
  endereco              text,
  cidade                text,
  estado                text,
  cep                   text,
  responsavel           text,
  observacoes           text,
  status                public.status_empresa not null default 'ativo',
  armazenamento_usado   bigint not null default 0,
  armazenamento_limite  bigint not null default 5368709120,
  metadados             jsonb not null default '{}'::jsonb
);

create index if not exists idx_empresas_status on public.empresas (status);
create index if not exists idx_empresas_cnpj on public.empresas (cnpj);
create index if not exists idx_empresas_nome on public.empresas using gin (to_tsvector('portuguese', nome_fantasia || ' ' || razao_social));

alter table public.perfis
  add constraint perfis_empresa_id_fkey
  foreign key (empresa_id) references public.empresas(id) on delete set null;

-- -- Categorias ----
create table if not exists public.categorias (
  id          uuid primary key default gen_random_uuid(),
  criado_em   timestamptz not null default now(),
  nome        text not null unique,
  slug        text not null unique,
  descricao   text,
  cor         text default '#6b6b67',
  padrao      boolean not null default false,
  ordem       int not null default 0
);

-- -- Documentos ----
create table if not exists public.documentos (
  id                  uuid primary key default gen_random_uuid(),
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now(),
  titulo              text not null,
  descricao           text,
  categoria_id        uuid references public.categorias(id) on delete set null,
  chave_arquivo       text not null unique,
  nome_arquivo        text not null,
  tamanho_arquivo     bigint not null default 0,
  tipo_mime           text not null default 'application/octet-stream',
  extensao            text,
  tags                text[] not null default '{}',
  valido_ate          date,
  observacoes         text,
  enviado_por         uuid references public.perfis(id) on delete set null,
  total_downloads     int not null default 0,
  ativo               boolean not null default true,
  permitir_compartilhar boolean not null default false,
  metadados           jsonb not null default '{}'::jsonb
);

create index if not exists idx_documentos_criado on public.documentos (criado_em desc);
create index if not exists idx_documentos_categoria on public.documentos (categoria_id);
create index if not exists idx_documentos_titulo on public.documentos using gin (to_tsvector('portuguese', titulo || ' ' || coalesce(descricao, '')));
create index if not exists idx_documentos_tags on public.documentos using gin (tags);

-- -- Documentos ↔ Empresas (N:N) ---
create table if not exists public.documento_empresas (
  id            uuid primary key default gen_random_uuid(),
  criado_em     timestamptz not null default now(),
  documento_id  uuid not null references public.documentos(id) on delete cascade,
  empresa_id    uuid not null references public.empresas(id) on delete cascade,
  unique (documento_id, empresa_id)
);

create index if not exists idx_doc_empresas_empresa on public.documento_empresas (empresa_id);
create index if not exists idx_doc_empresas_documento on public.documento_empresas (documento_id);

-- -- Histórico de documentos ----
create table if not exists public.documento_historico (
  id            uuid primary key default gen_random_uuid(),
  criado_em     timestamptz not null default now(),
  documento_id  uuid not null references public.documentos(id) on delete cascade,
  usuario_id    uuid references public.perfis(id) on delete set null,
  acao          text not null,
  alteracoes    jsonb not null default '{}'::jsonb
);

create index if not exists idx_doc_historico_documento on public.documento_historico (documento_id, criado_em desc);

-- -- Acessos a documentos ----
create table if not exists public.documento_acessos (
  id            uuid primary key default gen_random_uuid(),
  criado_em     timestamptz not null default now(),
  documento_id  uuid not null references public.documentos(id) on delete cascade,
  usuario_id    uuid references public.perfis(id) on delete set null,
  empresa_id    uuid references public.empresas(id) on delete set null,
  acao          text not null check (acao in ('visualizacao', 'download', 'compartilhamento')),
  endereco_ip   inet,
  agente_usuario text
);

create index if not exists idx_doc_acessos_documento on public.documento_acessos (documento_id, criado_em desc);
create index if not exists idx_doc_acessos_usuario on public.documento_acessos (usuario_id, criado_em desc);

-- -- Comunicados (Mural) -----
create table if not exists public.comunicados (
  id            uuid primary key default gen_random_uuid(),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  titulo        text not null,
  corpo         text not null,
  prioridade    public.prioridade_comunicado not null default 'normal',
  fixado        boolean not null default false,
  ativo         boolean not null default true,
  publicado_em  timestamptz not null default now(),
  expira_em     timestamptz,
  autor_id      uuid references public.perfis(id) on delete set null,
  para_todos    boolean not null default true,
  anexos        jsonb not null default '[]'::jsonb,
  metadados     jsonb not null default '{}'::jsonb
);

create index if not exists idx_comunicados_ativo on public.comunicados (ativo, publicado_em desc);

-- -- Comunicados ↔ Empresas ----
create table if not exists public.comunicado_empresas (
  comunicado_id uuid not null references public.comunicados(id) on delete cascade,
  empresa_id    uuid not null references public.empresas(id) on delete cascade,
  primary key (comunicado_id, empresa_id)
);

-- -- Confirmação de leitura -----
create table if not exists public.comunicado_leituras (
  comunicado_id uuid not null references public.comunicados(id) on delete cascade,
  usuario_id    uuid not null references public.perfis(id) on delete cascade,
  lido_em       timestamptz not null default now(),
  primary key (comunicado_id, usuario_id)
);

-- -- Conversas (Chat) ----
create table if not exists public.conversas (
  id            uuid primary key default gen_random_uuid(),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  empresa_id    uuid references public.empresas(id) on delete cascade,
  assunto       text,
  ativo         boolean not null default true,
  metadados     jsonb not null default '{}'::jsonb
);

create index if not exists idx_conversas_empresa on public.conversas (empresa_id, atualizado_em desc);

-- -- Mensagens -----
create table if not exists public.mensagens (
  id            uuid primary key default gen_random_uuid(),
  criado_em     timestamptz not null default now(),
  conversa_id   uuid not null references public.conversas(id) on delete cascade,
  remetente_id  uuid not null references public.perfis(id) on delete cascade,
  corpo         text not null,
  anexos        jsonb not null default '[]'::jsonb,
  lida          boolean not null default false,
  lida_em       timestamptz
);

create index if not exists idx_mensagens_conversa on public.mensagens (conversa_id, criado_em);

-- -- Auditoria -----
create table if not exists public.auditoria (
  id              uuid primary key default gen_random_uuid(),
  criado_em       timestamptz not null default now(),
  usuario_id      uuid references public.perfis(id) on delete set null,
  empresa_id      uuid references public.empresas(id) on delete set null,
  acao            public.acao_auditoria not null,
  recurso         text,
  recurso_id      uuid,
  detalhes        jsonb not null default '{}'::jsonb,
  endereco_ip     inet,
  agente_usuario  text
);

create index if not exists idx_auditoria_criado on public.auditoria (criado_em desc);
create index if not exists idx_auditoria_usuario on public.auditoria (usuario_id, criado_em desc);
create index if not exists idx_auditoria_acao on public.auditoria (acao, criado_em desc);

-- -- Configurações do sistema ---
create table if not exists public.configuracoes (
  chave           text primary key,
  valor           jsonb not null,
  atualizado_em   timestamptz not null default now(),
  atualizado_por  uuid references public.perfis(id) on delete set null
);

-- -- Funções auxiliares ------
create or replace function public.eh_administrador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid()
      and papel in ('super_administrador', 'administrador')
      and ativo = true
  );
$$;

create or replace function public.eh_membro_empresa(id_empresa_alvo uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid()
      and empresa_id = id_empresa_alvo
      and ativo = true
  );
$$;

create or replace function public.obter_empresa_do_usuario()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select empresa_id from public.perfis where id = auth.uid();
$$;

create or replace function public.atualizar_data_modificacao()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

-- Triggers atualizado_em
drop trigger if exists perfis_atualizado_em on public.perfis;
create trigger perfis_atualizado_em before update on public.perfis
  for each row execute function public.atualizar_data_modificacao();

drop trigger if exists empresas_atualizado_em on public.empresas;
create trigger empresas_atualizado_em before update on public.empresas
  for each row execute function public.atualizar_data_modificacao();

drop trigger if exists documentos_atualizado_em on public.documentos;
create trigger documentos_atualizado_em before update on public.documentos
  for each row execute function public.atualizar_data_modificacao();

drop trigger if exists comunicados_atualizado_em on public.comunicados;
create trigger comunicados_atualizado_em before update on public.comunicados
  for each row execute function public.atualizar_data_modificacao();

drop trigger if exists conversas_atualizado_em on public.conversas;
create trigger conversas_atualizado_em before update on public.conversas
  for each row execute function public.atualizar_data_modificacao();

-- -- Trigger: criar perfil ao registrar ----
create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, email, nome_completo, url_avatar)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'nome_completo',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'url_avatar',
      new.raw_user_meta_data->>'avatar_url'
    )
  );
  return new;
end;
$$;

drop trigger if exists ao_criar_usuario_auth on auth.users;
create trigger ao_criar_usuario_auth
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();

-- -- RLS --------
alter table public.perfis enable row level security;
alter table public.empresas enable row level security;
alter table public.categorias enable row level security;
alter table public.documentos enable row level security;
alter table public.documento_empresas enable row level security;
alter table public.documento_historico enable row level security;
alter table public.documento_acessos enable row level security;
alter table public.comunicados enable row level security;
alter table public.comunicado_empresas enable row level security;
alter table public.comunicado_leituras enable row level security;
alter table public.conversas enable row level security;
alter table public.mensagens enable row level security;
alter table public.auditoria enable row level security;
alter table public.configuracoes enable row level security;

-- Perfis
create policy "perfis_selecionar_proprio" on public.perfis for select to authenticated
  using (id = auth.uid() or public.eh_administrador());

create policy "perfis_atualizar_proprio" on public.perfis for update to authenticated
  using (id = auth.uid() or public.eh_administrador())
  with check (id = auth.uid() or public.eh_administrador());

create policy "perfis_admin_tudo" on public.perfis for all to authenticated
  using (public.eh_administrador()) with check (public.eh_administrador());

-- Empresas
create policy "empresas_admin_tudo" on public.empresas for all to authenticated
  using (public.eh_administrador()) with check (public.eh_administrador());

create policy "empresas_selecionar_propria" on public.empresas for select to authenticated
  using (id = public.obter_empresa_do_usuario());

create policy "empresas_atualizar_propria_limitado" on public.empresas for update to authenticated
  using (
    id = public.obter_empresa_do_usuario()
    and exists (select 1 from public.perfis where id = auth.uid() and papel = 'administrador_empresa')
  )
  with check (id = public.obter_empresa_do_usuario());

-- Categorias
create policy "categorias_selecionar" on public.categorias for select to authenticated using (true);
create policy "categorias_admin" on public.categorias for all to authenticated
  using (public.eh_administrador()) with check (public.eh_administrador());

-- Documentos
create policy "documentos_admin_tudo" on public.documentos for all to authenticated
  using (public.eh_administrador()) with check (public.eh_administrador());

create policy "documentos_empresa_selecionar" on public.documentos for select to authenticated
  using (
    exists (
      select 1 from public.documento_empresas de
      where de.documento_id = documentos.id
        and de.empresa_id = public.obter_empresa_do_usuario()
    )
    and ativo = true
  );

-- Documento empresas
create policy "doc_empresas_admin" on public.documento_empresas for all to authenticated
  using (public.eh_administrador()) with check (public.eh_administrador());

create policy "doc_empresas_selecionar" on public.documento_empresas for select to authenticated
  using (empresa_id = public.obter_empresa_do_usuario());

-- Histórico e acessos
create policy "doc_historico_admin" on public.documento_historico for all to authenticated
  using (public.eh_administrador()) with check (public.eh_administrador());

create policy "doc_historico_empresa" on public.documento_historico for select to authenticated
  using (
    exists (
      select 1 from public.documento_empresas de
      join public.documentos d on d.id = de.documento_id
      where d.id = documento_historico.documento_id
        and de.empresa_id = public.obter_empresa_do_usuario()
    )
  );

create policy "doc_acessos_admin" on public.documento_acessos for all to authenticated
  using (public.eh_administrador()) with check (public.eh_administrador());

create policy "doc_acessos_inserir" on public.documento_acessos for insert to authenticated
  with check (usuario_id = auth.uid());

create policy "doc_acessos_empresa" on public.documento_acessos for select to authenticated
  using (empresa_id = public.obter_empresa_do_usuario());

-- Comunicados
create policy "comunicados_admin" on public.comunicados for all to authenticated
  using (public.eh_administrador()) with check (public.eh_administrador());

create policy "comunicados_empresa_selecionar" on public.comunicados for select to authenticated
  using (
    ativo = true
    and (expira_em is null or expira_em > now())
    and (
      para_todos = true
      or exists (
        select 1 from public.comunicado_empresas ce
        where ce.comunicado_id = comunicados.id
          and ce.empresa_id = public.obter_empresa_do_usuario()
      )
    )
  );

create policy "comunicado_empresas_admin" on public.comunicado_empresas for all to authenticated
  using (public.eh_administrador()) with check (public.eh_administrador());

create policy "comunicado_leituras_proprio" on public.comunicado_leituras for all to authenticated
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

-- Conversas e mensagens
create policy "conversas_admin" on public.conversas for all to authenticated
  using (public.eh_administrador()) with check (public.eh_administrador());

create policy "conversas_empresa" on public.conversas for select to authenticated
  using (empresa_id = public.obter_empresa_do_usuario());

create policy "conversas_empresa_inserir" on public.conversas for insert to authenticated
  with check (empresa_id = public.obter_empresa_do_usuario());

create policy "mensagens_participante" on public.mensagens for all to authenticated
  using (
    public.eh_administrador()
    or exists (
      select 1 from public.conversas c
      where c.id = mensagens.conversa_id
        and c.empresa_id = public.obter_empresa_do_usuario()
    )
  )
  with check (remetente_id = auth.uid());

-- Auditoria
create policy "auditoria_admin" on public.auditoria for select to authenticated
  using (public.eh_administrador());

create policy "auditoria_inserir" on public.auditoria for insert to authenticated
  with check (usuario_id = auth.uid() or public.eh_administrador());

-- Configurações
create policy "configuracoes_admin" on public.configuracoes for all to authenticated
  using (public.eh_administrador()) with check (public.eh_administrador());

create policy "configuracoes_leitura" on public.configuracoes for select to authenticated
  using (chave in ('tamanho_max_upload', 'extensoes_permitidas', 'categorias_publicas'));

-- -- Dados iniciais ---
insert into public.categorias (nome, slug, descricao, padrao, ordem) values
  ('Geral', 'geral', 'Documentos gerais', true, 0),
  ('Certificados', 'certificados', 'Certificados e laudos', false, 1),
  ('Contratos', 'contratos', 'Contratos e acordos', false, 2),
  ('FISPQ / FDS', 'fispq-fds', 'Fichas de segurança', false, 3),
  ('Relatórios', 'relatorios', 'Relatórios técnicos', false, 4)
on conflict (slug) do nothing;

insert into public.configuracoes (chave, valor) values
  ('tamanho_max_upload', '104857600'),
  ('extensoes_permitidas', '["pdf","doc","docx","xls","xlsx","ppt","pptx","jpg","jpeg","png","gif","webp","zip","rar","txt","csv"]'),
  ('dias_retencao', '0'),
  ('email_comunicado_automatico', 'false')
on conflict (chave) do nothing;

-- -- Realtime -----
-- alter publication supabase_realtime add table public.mensagens;
-- alter publication supabase_realtime add table public.comunicados;
