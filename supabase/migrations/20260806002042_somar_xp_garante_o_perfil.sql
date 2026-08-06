-- xp_semanal.perfil_id aponta pra perfis(id). Se a linha de perfil ainda não
-- existir, somar_xp morre com violação de chave estrangeira — e o site engole
-- o erro de propósito (sincronizar é bônus), então o XP da semana sumiria em
-- silêncio. Isso acontece na PRIMEIRA resposta certa de quem acabou de entrar:
-- enviarProgresso() e somarXpRemoto() saem juntas, e se somar_xp chega antes,
-- não tem perfil ainda. A função passa a criar a própria linha.
create or replace function public.somar_xp(quantidade integer)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  eu uuid := auth.uid();
begin
  if eu is null then raise exception 'sem sessão'; end if;
  if quantidade <= 0 or quantidade > 1000 then raise exception 'quantidade inválida'; end if;

  -- sem apelido: quem não escolheu apelido não aparece no ranking, mas o XP
  -- da semana fica guardado pra quando escolher
  insert into public.perfis (id) values (eu) on conflict (id) do nothing;

  insert into public.xp_semanal (perfil_id, semana, xp)
  values (eu, public.inicio_da_semana(), quantidade)
  on conflict (perfil_id, semana) do update set xp = public.xp_semanal.xp + excluded.xp;
end;
$$;

revoke execute on function public.somar_xp(integer) from public;
grant execute on function public.somar_xp(integer) to authenticated;
