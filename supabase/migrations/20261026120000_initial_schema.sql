-- Recanto do Tuiuiú: esquema inicial
-- Rodar uma vez no Supabase (SQL Editor). Salvar em supabase/migrations/.

-- ============================================================
-- 1. Tipos
-- ============================================================
create type public.reservation_status as enum ('interesse', 'confirmada', 'concluida', 'cancelada');
create type public.period_kind as enum ('defeso', 'bloqueio');
create type public.price_unit as enum ('por_pessoa_dia', 'por_barco_dia', 'por_barco', 'sob_cotacao');

-- ============================================================
-- 2. Tabelas
-- ============================================================

-- Perfis: um por usuário cadastrado. Papel 'admin' só é dado manualmente.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'visitor' check (role in ('visitor', 'admin')),
  full_name text,
  created_at timestamptz not null default now()
);

-- Experiências extras (pesca, passeio, pacote fechado). Preço em centavos.
create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price_cents integer check (price_cents >= 0), -- null = sob cotação
  unit public.price_unit not null,
  max_people integer check (max_people > 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Períodos em que a pesca ou a hospedagem não está disponível (defeso, bloqueios).
-- ATENÇÃO: o campo "label" é público (aparece no site).
create table public.closed_periods (
  id uuid primary key default gen_random_uuid(),
  kind public.period_kind not null,
  starts_on date not null,
  ends_on date not null,
  label text,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

-- Textos e valores editáveis (diária, sinal, capacidade...).
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Pedidos de reserva / interesse.
create table public.reservation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null, -- opcional: login não é obrigatório
  guest_name text not null check (char_length(guest_name) between 2 and 120),
  whatsapp text not null check (whatsapp ~ '^[0-9+() -]{8,20}$'),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  check_in date not null,
  check_out date not null,
  guests integer not null check (guests between 1 and 18),
  status public.reservation_status not null default 'interesse',
  deposit_paid boolean not null default false, -- sinal de 50%
  message text check (char_length(message) <= 1000),
  admin_notes text, -- anotações internas (só admin)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out > check_in)
);

-- Experiências ligadas a cada pedido (e o dia em que acontecem).
create table public.reservation_experiences (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservation_requests (id) on delete cascade,
  experience_id uuid not null references public.experiences (id),
  scheduled_on date,
  quantity integer not null default 1 check (quantity > 0),
  notes text
);

create index on public.reservation_requests (status, check_in);
create index on public.reservation_experiences (reservation_id);

-- ============================================================
-- 3. Funções auxiliares
-- ============================================================

-- Verifica se quem está logado é admin.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Cria o perfil automaticamente quando alguém se cadastra.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atualiza updated_at automaticamente.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reservation_requests_updated_at
  before update on public.reservation_requests
  for each row execute function public.set_updated_at();

-- ÚNICA porta de entrada para o visitante criar um pedido.
-- O visitante nunca escreve direto nas tabelas: só chama esta função.
create function public.create_reservation_request(
  p_guest_name text,
  p_whatsapp text,
  p_email text,
  p_check_in date,
  p_check_out date,
  p_guests integer,
  p_message text,
  p_experience_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_check_in < current_date then
    raise exception 'A data de chegada não pode estar no passado';
  end if;

  insert into public.reservation_requests
    (user_id, guest_name, whatsapp, email, check_in, check_out, guests, message)
  values
    (auth.uid(), trim(p_guest_name), trim(p_whatsapp), nullif(trim(p_email), ''),
     p_check_in, p_check_out, p_guests, nullif(trim(p_message), ''))
  returning id into v_id;

  insert into public.reservation_experiences (reservation_id, experience_id)
  select v_id, e.id
  from public.experiences e
  where e.id = any (coalesce(p_experience_ids, '{}')) and e.active;

  return v_id;
end;
$$;

revoke all on function public.create_reservation_request(text, text, text, date, date, integer, text, uuid[]) from public;
grant execute on function public.create_reservation_request(text, text, text, date, date, integer, text, uuid[]) to anon, authenticated;

-- ============================================================
-- 4. Segurança (RLS): tudo bloqueado, só abrimos o necessário
-- ============================================================
alter table public.profiles enable row level security;
alter table public.experiences enable row level security;
alter table public.closed_periods enable row level security;
alter table public.site_settings enable row level security;
alter table public.reservation_requests enable row level security;
alter table public.reservation_experiences enable row level security;

-- profiles: cada um vê o próprio; admin vê todos. Ninguém altera papel pelo site.
create policy "profiles: ver o proprio" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles: admin ve todos" on public.profiles
  for select to authenticated using (public.is_admin());

-- experiences: qualquer pessoa vê as ativas; admin gerencia.
create policy "experiences: publico ve ativas" on public.experiences
  for select to anon, authenticated using (active);
create policy "experiences: admin gerencia" on public.experiences
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- closed_periods: público (o site precisa mostrar o defeso); admin gerencia.
create policy "closed_periods: publico ve" on public.closed_periods
  for select to anon, authenticated using (true);
create policy "closed_periods: admin gerencia" on public.closed_periods
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- site_settings: público lê; admin altera.
create policy "site_settings: publico le" on public.site_settings
  for select to anon, authenticated using (true);
create policy "site_settings: admin gerencia" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- reservation_requests: visitante logado vê só os próprios; admin faz tudo.
-- (visitante anônimo não tem acesso nenhum, só a função acima)
create policy "reservas: usuario ve as proprias" on public.reservation_requests
  for select to authenticated using (user_id = auth.uid());
create policy "reservas: admin gerencia" on public.reservation_requests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- reservation_experiences: mesma lógica, via pedido pai.
create policy "reserva_experiencias: usuario ve as proprias" on public.reservation_experiences
  for select to authenticated using (
    exists (
      select 1 from public.reservation_requests r
      where r.id = reservation_id and r.user_id = auth.uid()
    )
  );
create policy "reserva_experiencias: admin gerencia" on public.reservation_experiences
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 5. Dados iniciais (valores do site antigo; editáveis depois)
-- ============================================================
insert into public.experiences (slug, name, description, price_cents, unit, max_people, sort_order) values
  ('diaria-de-pesca', 'Diária de pesca', '06h às 18h. Barco de 6 m, piloteiro e motor. Grupo de até 3 pessoas.', 35000, 'por_barco_dia', 3, 1),
  ('passeio-ecologico', 'Passeio ecológico', '1 hora, gasolina inclusa e roteiro fotográfico. Grupo de até 3 pessoas.', 25000, 'por_barco', 3, 2),
  ('pacote-fechado', 'Pacote fechado', 'Hospedagem, barco, iscas e translado de Cuiabá. Valor sob cotação.', null, 'sob_cotacao', null, 3);

insert into public.site_settings (key, value) values
  ('diaria_hospedagem_cents', '30000'),
  ('sinal_percentual', '50'),
  ('capacidade_maxima', '18');

-- O defeso NÃO foi cadastrado: as datas mudam todo ano.
-- Depois de confirmar as datas oficiais, exemplo:
-- insert into public.closed_periods (kind, starts_on, ends_on, label)
-- values ('defeso', '2026-11-01', '2027-01-31', 'Defeso: apenas contemplação');
