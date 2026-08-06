-- A tela promete "só apelido e xp ficam visíveis". Não era verdade: as
-- políticas de leitura estavam em `true`, então qualquer pessoa logada
-- conseguia listar a tabela inteira — inclusive o id de quem NUNCA escolheu
-- apelido, ou seja, de quem decidiu não aparecer no ranking.
--
-- O ranking não precisa dessa abertura: ele passa por ranking_da_semana(),
-- que é SECURITY DEFINER e por isso enxerga as tabelas por cima do RLS,
-- devolvendo só as três colunas que a tela mostra.

drop policy "perfis visiveis para autenticados" on public.perfis;
create policy "le o proprio perfil" on public.perfis
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy "ranking visivel para autenticados" on public.xp_semanal;
create policy "le o proprio xp semanal" on public.xp_semanal
  for select to authenticated
  using ((select auth.uid()) = perfil_id);
