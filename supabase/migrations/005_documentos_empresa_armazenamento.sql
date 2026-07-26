-- ============================================================
-- VIGMED - Upload por empresa + origem + armazenamento
-- ============================================================

do $$ begin
  create type public.origem_publicacao_documento as enum ('admin', 'empresa');
exception when duplicate_object then null;
end $$;

alter table public.documentos
  add column if not exists origem_publicacao public.origem_publicacao_documento not null default 'admin';

create index if not exists idx_documentos_origem on public.documentos (origem_publicacao);

create or replace function public.eh_usuario_empresa_ativo()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid()
      and papel in ('administrador_empresa', 'usuario_empresa')
      and ativo = true
  );
$$;

-- Empresa: publicar documentos na própria empresa
drop policy if exists "documentos_empresa_inserir" on public.documentos;
create policy "documentos_empresa_inserir" on public.documentos
  for insert to authenticated
  with check (
    public.eh_usuario_empresa_ativo()
    and origem_publicacao = 'empresa'
    and enviado_por = auth.uid()
  );

drop policy if exists "doc_empresas_empresa_inserir" on public.documento_empresas;
create policy "doc_empresas_empresa_inserir" on public.documento_empresas
  for insert to authenticated
  with check (
    empresa_id = public.obter_empresa_do_usuario()
    and public.eh_usuario_empresa_ativo()
  );

-- Recalcula armazenamento_usado de uma empresa
create or replace function public.recalcular_armazenamento_empresa(id_empresa uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.empresas e
  set armazenamento_usado = coalesce((
    select sum(d.tamanho_arquivo)
    from public.documentos d
    inner join public.documento_empresas de on de.documento_id = d.id
    where de.empresa_id = id_empresa
      and d.ativo = true
  ), 0)
  where e.id = id_empresa;
end;
$$;
