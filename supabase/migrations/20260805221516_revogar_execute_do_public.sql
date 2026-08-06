-- No Postgres, EXECUTE em função nasce concedido a PUBLIC, e `anon` herda
-- de PUBLIC. Revogar só de `anon` não tira nada. Tem que tirar de PUBLIC e
-- devolver nominalmente a quem deve chamar.
revoke execute on function public.somar_xp(integer) from public;
revoke execute on function public.ranking_da_semana() from public;
revoke execute on function public.inicio_da_semana(date) from public;

grant execute on function public.somar_xp(integer) to authenticated;
grant execute on function public.ranking_da_semana() to authenticated;
grant execute on function public.inicio_da_semana(date) to authenticated;
