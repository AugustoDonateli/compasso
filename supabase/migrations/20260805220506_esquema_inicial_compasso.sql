-- Compasso: perfis, progresso e ranking semanal.
--
-- O site promete "sem cadastro", e isso é mantido: a autenticação é anônima
-- (nenhum e-mail ou senha), criada em silêncio no primeiro acesso. O apelido
-- só é pedido se a pessoa quiser aparecer no ranking.

create table public.perfis (
  id uuid primary key references auth.users on delete cascade,
  apelido text unique,
  instrumento text,
  criado_em timestamptz not null default now()
);
comment on table public.perfis is 'Um por pessoa. O apelido é opcional e só existe pra aparecer no ranking.';

create table public.progresso (
  perfil_id uuid primary key references public.perfis on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  ultimo_dia date,
  licoes_concluidas text[] not null default '{}',
  atualizado_em timestamptz not null default now()
);
comment on table public.progresso is 'Espelha o que hoje vive no localStorage, pra sincronizar entre aparelhos.';

-- XP por semana: a pesquisa de gamificação é clara que ranking eterno
-- desanima quem chega depois. Toda segunda-feira todo mundo começa do zero.
create table public.xp_semanal (
  perfil_id uuid not null references public.perfis on delete cascade,
  semana date not null,
  xp integer not null default 0 check (xp >= 0),
  primary key (perfil_id, semana)
);
comment on table public.xp_semanal is 'Ranking reinicia toda semana pra ninguém ficar pra trás sem chance.';

create index xp_semanal_ranking on public.xp_semanal (semana, xp desc);

alter table public.perfis enable row level security;
alter table public.progresso enable row level security;
alter table public.xp_semanal enable row level security;

-- perfis: todo mundo autenticado vê os apelidos (é o ranking), mas só
-- mexe no próprio
create policy "perfis visiveis para autenticados"
  on public.perfis for select to authenticated using (true);
create policy "cria o proprio perfil"
  on public.perfis for insert to authenticated with check (auth.uid() = id);
create policy "edita o proprio perfil"
  on public.perfis for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- progresso: privado. Ninguém vê o progresso do outro.
create policy "le o proprio progresso"
  on public.progresso for select to authenticated using (auth.uid() = perfil_id);
create policy "cria o proprio progresso"
  on public.progresso for insert to authenticated with check (auth.uid() = perfil_id);
create policy "edita o proprio progresso"
  on public.progresso for update to authenticated using (auth.uid() = perfil_id) with check (auth.uid() = perfil_id);

-- xp semanal: leitura pública entre autenticados (é o ranking), escrita só
-- pela função abaixo
create policy "ranking visivel para autenticados"
  on public.xp_semanal for select to authenticated using (true);

-- A segunda-feira da semana de uma data
create or replace function public.inicio_da_semana(d date default current_date)
returns date language sql immutable as $$
  select d - ((extract(isodow from d)::int - 1) || ' days')::interval;
$$;

-- Soma XP de forma atômica: o total e o da semana, numa transação só.
-- Fica em security definer pra poder escrever em xp_semanal, mas só age
-- sobre o próprio usuário — nunca aceita um id vindo do cliente.
create or replace function public.somar_xp(quantidade integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  eu uuid := auth.uid();
begin
  if eu is null then raise exception 'sem sessão'; end if;
  if quantidade <= 0 or quantidade > 1000 then raise exception 'quantidade inválida'; end if;

  update public.progresso set xp = xp + quantidade, atualizado_em = now() where perfil_id = eu;

  insert into public.xp_semanal (perfil_id, semana, xp)
  values (eu, public.inicio_da_semana(), quantidade)
  on conflict (perfil_id, semana) do update set xp = public.xp_semanal.xp + excluded.xp;
end;
$$;

-- O ranking da semana. Só apelido e XP: progresso de ninguém vaza.
create or replace function public.ranking_da_semana()
returns table (apelido text, xp integer, posicao bigint)
language sql
security definer
set search_path = public
as $$
  select p.apelido, x.xp, rank() over (order by x.xp desc) as posicao
  from public.xp_semanal x
  join public.perfis p on p.id = x.perfil_id
  where x.semana = public.inicio_da_semana()
    and p.apelido is not null
  order by x.xp desc
  limit 50;
$$;
