-- DEFEITO CORRIGIDO: dois donos pra mesma coluna.
--
-- somar_xp() fazia `xp = xp + quantidade` em progresso, e enviarProgresso()
-- gravava `xp = <total local>` na mesma coluna. As duas saem juntas a cada
-- resposta certa, sem ordem garantida. Quando somar_xp chegava por último, o
-- servidor ficava com total+10 enquanto o local tinha total. Aí sincronizar()
-- faz Math.max e o local sobe pro número inflado — e na resposta seguinte
-- infla de novo. XP crescendo sozinho, composto.
--
-- Cada número passa a ter um dono só:
--   progresso.xp   total — do cliente (local-first, junta por Math.max)
--   xp_semanal.xp  semana — do servidor (soma atômica, não dá pra forjar)
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

  insert into public.xp_semanal (perfil_id, semana, xp)
  values (eu, public.inicio_da_semana(), quantidade)
  on conflict (perfil_id, semana) do update set xp = public.xp_semanal.xp + excluded.xp;
end;
$$;

revoke execute on function public.somar_xp(integer) from public;
grant execute on function public.somar_xp(integer) to authenticated;
