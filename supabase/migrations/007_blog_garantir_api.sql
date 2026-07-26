-- ============================================================
-- VIGMED - Garante tabelas do blog e recarrega cache da API
-- Corrige PGRST205 quando posts_blog existe no PG mas não na API
-- ============================================================

do $$ begin
  create type public.status_post_blog as enum ('rascunho', 'publicado', 'arquivado');
exception when duplicate_object then null;
end $$;

create table if not exists public.posts_blog (
  id                  uuid primary key default gen_random_uuid(),
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now(),
  titulo              text not null,
  slug                text not null unique,
  resumo              text,
  corpo_html          text not null default '',
  imagem_capa_url     text,
  imagem_capa_chave   text,
  meta_titulo         text,
  meta_descricao      text,
  tags                text[] not null default '{}',
  status              public.status_post_blog not null default 'rascunho',
  publicado_em        timestamptz,
  autor_id            uuid references public.perfis(id) on delete set null,
  total_visualizacoes bigint not null default 0,
  metadados           jsonb not null default '{}'::jsonb
);

create table if not exists public.blog_visualizacoes (
  id             uuid primary key default gen_random_uuid(),
  post_id        uuid not null references public.posts_blog(id) on delete cascade,
  visualizado_em timestamptz not null default now(),
  origem         text,
  usuario_id     uuid references public.perfis(id) on delete set null,
  sessao_hash    text
);

create index if not exists idx_posts_blog_slug on public.posts_blog (slug);
create index if not exists idx_posts_blog_status on public.posts_blog (status, publicado_em desc);
create index if not exists idx_blog_visualizacoes_post on public.blog_visualizacoes (post_id, visualizado_em desc);

drop trigger if exists trg_posts_blog_atualizado on public.posts_blog;
create trigger trg_posts_blog_atualizado
  before update on public.posts_blog
  for each row execute function public.atualizar_data_modificacao();

alter table public.posts_blog enable row level security;
alter table public.blog_visualizacoes enable row level security;

drop policy if exists posts_blog_select_publico on public.posts_blog;
create policy posts_blog_select_publico on public.posts_blog
  for select
  using (
    status = 'publicado'
    and publicado_em is not null
    and publicado_em <= now()
  );

drop policy if exists posts_blog_admin on public.posts_blog;
create policy posts_blog_admin on public.posts_blog
  for all
  using (public.eh_administrador())
  with check (public.eh_administrador());

drop policy if exists blog_visualizacoes_admin_select on public.blog_visualizacoes;
create policy blog_visualizacoes_admin_select on public.blog_visualizacoes
  for select
  using (public.eh_administrador());

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.posts_blog to anon, authenticated, service_role;
grant select, insert, update, delete on public.blog_visualizacoes to anon, authenticated, service_role;

notify pgrst, 'reload schema';
