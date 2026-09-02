-- =====================================================================
-- Meu Mundinho Azul — schema Supabase
-- Rode inteiro no SQL Editor do projeto.
-- =====================================================================

create type categoria_produto as enum ('ENXOVAL', 'QUARTO');
create type status_produto  as enum ('PENDENTE', 'PARCIAL', 'COMPLETO');

-- ---------------------------------------------------------------------
-- Quem pode ver os dados: você e sua esposa. Cada um tem login próprio,
-- mas os dois enxergam exatamente a mesma lista.
-- ---------------------------------------------------------------------
create table membro (
  user_id  uuid primary key references auth.users on delete cascade,
  nome     text not null,
  criado_em timestamptz not null default now()
);

create or replace function is_membro()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from membro where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- O Daniel. Guardamos só a DUM (data da última menstruação);
-- a idade gestacional é calculada em runtime, sem cron nem update diário.
-- ---------------------------------------------------------------------
create table bebe (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null default 'Daniel',
  dum       date not null,
  criado_em timestamptz not null default now()
);

create table produto (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  categoria     categoria_produto not null,
  subcategoria  text,
  qtd_desejada  integer not null default 1 check (qtd_desejada > 0),
  valor_orcado  numeric(10,2) not null default 0 check (valor_orcado >= 0),
  observacao    text,
  criado_por    uuid references auth.users,
  criado_em     timestamptz not null default now()
);

create table compra (
  id          uuid primary key default gen_random_uuid(),
  produto_id  uuid not null references produto on delete cascade,
  qtd         integer not null check (qtd > 0),
  valor_pago  numeric(10,2) not null default 0 check (valor_pago >= 0),
  loja        text,
  data        date not null default current_date,
  criado_por  uuid references auth.users,
  criado_em   timestamptz not null default now()
);

create index compra_produto_idx on compra (produto_id);
create index produto_categoria_idx on produto (categoria);

-- ---------------------------------------------------------------------
-- View de leitura: a lista, os filtros e todos os gráficos leem daqui.
-- qtd_comprada / valor_gasto / status nunca são gravados, sempre derivados.
-- ---------------------------------------------------------------------
create or replace view produto_status
with (security_invoker = on) as
select
  p.id,
  p.nome,
  p.categoria,
  p.subcategoria,
  p.qtd_desejada,
  p.valor_orcado,
  p.observacao,
  p.criado_em,
  coalesce(sum(c.qtd), 0)::int              as qtd_comprada,
  coalesce(sum(c.valor_pago), 0)::numeric   as valor_gasto,
  max(c.data)                                as ultima_compra,
  case
    when coalesce(sum(c.qtd), 0) = 0                 then 'PENDENTE'
    when coalesce(sum(c.qtd), 0) >= p.qtd_desejada   then 'COMPLETO'
    else 'PARCIAL'
  end::status_produto                        as status
from produto p
left join compra c on c.produto_id = p.id
group by p.id;

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table membro  enable row level security;
alter table bebe    enable row level security;
alter table produto enable row level security;
alter table compra  enable row level security;

create policy "membro lê o próprio registro" on membro
  for select using (user_id = auth.uid());

create policy "membros leem o bebê" on bebe
  for select using (is_membro());
create policy "membros editam o bebê" on bebe
  for update using (is_membro()) with check (is_membro());

create policy "membros leem produtos" on produto
  for select using (is_membro());
create policy "membros criam produtos" on produto
  for insert with check (is_membro());
create policy "membros editam produtos" on produto
  for update using (is_membro()) with check (is_membro());
create policy "membros apagam produtos" on produto
  for delete using (is_membro());

create policy "membros leem compras" on compra
  for select using (is_membro());
create policy "membros criam compras" on compra
  for insert with check (is_membro());
create policy "membros editam compras" on compra
  for update using (is_membro()) with check (is_membro());
create policy "membros apagam compras" on compra
  for delete using (is_membro());

-- =====================================================================
-- SEED — ajuste antes de rodar
-- =====================================================================

-- 1) Crie os dois usuários em Authentication → Users, depois cadastre-os:
-- insert into membro (user_id, nome) values
--   ('UUID-DO-VICTOR', 'Victor'),
--   ('UUID-DA-ESPOSA', 'Esposa');

-- 2) A DUM do Daniel:
-- insert into bebe (nome, dum) values ('Daniel', '2026-03-20');

-- 3) Lista inicial (exemplos — pode apagar e montar a sua):
insert into produto (nome, categoria, subcategoria, qtd_desejada, valor_orcado) values
  ('Body manga curta RN',      'ENXOVAL', 'Roupinhas', 5,  125.00),
  ('Body manga longa P',       'ENXOVAL', 'Roupinhas', 5,  140.00),
  ('Macacão de plush P',       'ENXOVAL', 'Roupinhas', 4,  240.00),
  ('Meias RN',                 'ENXOVAL', 'Roupinhas', 10,  90.00),
  ('Toalha com capuz',         'ENXOVAL', 'Banho',     2,  160.00),
  ('Kit mamadeira',            'ENXOVAL', 'Alimentação', 3, 310.00),
  ('Carrinho de bebê',         'ENXOVAL', 'Passeio',   1, 1800.00),
  ('Bebê conforto',            'ENXOVAL', 'Passeio',   1, 1200.00),
  ('Berço com grade removível','QUARTO',  'Móveis',    1, 2400.00),
  ('Cômoda com trocador',      'QUARTO',  'Móveis',    1, 1900.00),
  ('Poltrona de amamentação',  'QUARTO',  'Móveis',    1, 1500.00),
  ('Nichos de parede',         'QUARTO',  'Decoração', 4,  320.00),
  ('Tapete infantil',          'QUARTO',  'Decoração', 1,  280.00);
