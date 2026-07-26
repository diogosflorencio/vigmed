
do $$ begin
  create type public.ambiente_convite as enum ('adm', 'docs');
exception when duplicate_object then null;
end $$;

create table if not exists public.convites_acesso (
  id              uuid primary key default gen_random_uuid(),
  criado_em       timestamptz not null default now(),
  email           text not null,
  nome_completo   text not null default '',
  papel           public.papel_usuario not null,
  ambiente        public.ambiente_convite not null,
  empresa_id      uuid references public.empresas(id) on delete set null,
  convidado_por   uuid references public.perfis(id) on delete set null,
  usado_em        timestamptz,
  usuario_id      uuid references public.perfis(id) on delete set null,
  expira_em       timestamptz,
  ativo           boolean not null default true,
  observacoes     text
);

create index if not exists idx_convites_email on public.convites_acesso (lower(email));
create index if not exists idx_convites_pendentes on public.convites_acesso (usado_em) where usado_em is null;

create unique index if not exists idx_convites_email_pendente_unico
  on public.convites_acesso (lower(email))
  where usado_em is null and ativo = true;

-- Aplica papel/empresa do convite pendente ao criar perfil
create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_convite record;
  v_nome text;
  v_avatar text;
begin
  v_nome := coalesce(
    new.raw_user_meta_data->>'nome_completo',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );
  v_avatar := coalesce(
    new.raw_user_meta_data->>'url_avatar',
    new.raw_user_meta_data->>'avatar_url'
  );

  select *
  into v_convite
  from public.convites_acesso
  where lower(email) = lower(new.email)
    and usado_em is null
    and ativo = true
    and (expira_em is null or expira_em > now())
  order by criado_em desc
  limit 1;

  if v_convite is not null then
    insert into public.perfis (id, email, nome_completo, url_avatar, papel, empresa_id, ativo)
    values (
      new.id,
      new.email,
      coalesce(nullif(v_convite.nome_completo, ''), v_nome),
      v_avatar,
      v_convite.papel,
      v_convite.empresa_id,
      true
    );

    update public.convites_acesso
    set usado_em = now(), usuario_id = new.id
    where id = v_convite.id;
  else
    -- Sem convite: perfil inativo - login será bloqueado
    insert into public.perfis (id, email, nome_completo, url_avatar, ativo)
    values (new.id, new.email, v_nome, v_avatar, false);
  end if;

  return new;
end;
$$;

-- RLS convites
alter table public.convites_acesso enable row level security;

create policy "convites_admin_tudo" on public.convites_acesso
  for all to authenticated
  using (public.eh_administrador())
  with check (public.eh_administrador());

create policy "convites_empresa_selecionar" on public.convites_acesso
  for select to authenticated
  using (
    exists (
      select 1 from public.perfis p
      where p.id = auth.uid()
        and p.papel = 'administrador_empresa'
        and p.empresa_id = convites_acesso.empresa_id
    )
  );

create policy "convites_empresa_inserir" on public.convites_acesso
  for insert to authenticated
  with check (
    ambiente = 'docs'
    and papel in ('administrador_empresa', 'usuario_empresa')
    and exists (
      select 1 from public.perfis p
      where p.id = auth.uid()
        and p.papel = 'administrador_empresa'
        and p.empresa_id = convites_acesso.empresa_id
    )
  );
