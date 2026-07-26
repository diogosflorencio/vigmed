
create policy "perfis_empresa_admin_selecionar" on public.perfis
  for select to authenticated
  using (
    exists (
      select 1 from public.perfis p
      where p.id = auth.uid()
        and p.papel = 'administrador_empresa'
        and p.empresa_id = perfis.empresa_id
    )
  );
