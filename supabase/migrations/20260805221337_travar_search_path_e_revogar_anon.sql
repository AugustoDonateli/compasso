-- 1. search_path fixo: sem isso, quem chamar a função pode trocar o
--    significado de "date" ou dos operadores por objetos de outro schema.
create or replace function public.inicio_da_semana(d date default current_date)
returns date
language sql
immutable
set search_path to 'pg_catalog', 'public'
as $$
  select d - ((extract(isodow from d)::int - 1) || ' days')::interval;
$$;

-- 2. O papel `anon` (chave publicável, sem login) não precisa de nenhuma
--    destas: o app SEMPRE entra com sessão anônima antes de chamar.
--    somar_xp já barrava com 'sem sessão', mas barrar na porta é melhor
--    que barrar dentro da função.
revoke execute on function public.somar_xp(integer) from anon;
revoke execute on function public.ranking_da_semana() from anon;
revoke execute on function public.inicio_da_semana(date) from anon;

grant execute on function public.somar_xp(integer) to authenticated;
grant execute on function public.ranking_da_semana() to authenticated;
