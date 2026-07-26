-- ============================================================
-- VIGMED - Simplifica papéis: super_administrador → administrador
-- Mantém o enum legado (evita quebrar policies RLS existentes).
-- ============================================================

update public.perfis
set papel = 'administrador'
where papel = 'super_administrador';

update public.convites_acesso
set papel = 'administrador'
where papel = 'super_administrador';

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
      and papel = 'administrador'
      and ativo = true
  );
$$;
