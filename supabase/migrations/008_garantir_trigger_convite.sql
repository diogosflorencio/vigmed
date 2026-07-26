
-- Garante trigger de perfil alinhado ao convite (idempotente)
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
    insert into public.perfis (id, email, nome_completo, url_avatar, ativo)
    values (new.id, new.email, v_nome, v_avatar, false);
  end if;

  return new;
end;
$$;
