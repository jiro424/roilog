-- brands
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- series
create table public.series (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete set null,
  name text not null,
  started_at date,
  is_published boolean not null default true,
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- tournaments
create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  number integer not null,
  name text not null,
  default_buy_in integer,
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- entries
create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  buy_in integer not null default 0,
  entry_count integer not null default 1 check (entry_count >= 1),
  cash_amount integer not null default 0 check (cash_amount >= 0),
  total_invest_override integer check (total_invest_override is null or total_invest_override >= 0),
  total_entries integer check (total_entries is null or total_entries > 0),
  finish_position integer check (finish_position is null or finish_position > 0),
  played_at date not null default current_date,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  unique (user_id, tournament_id)
);

-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  x_handle text,
  hide_amounts boolean not null default false,
  avatar_url text,
  created_at timestamptz default now()
);

-- updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger entries_updated_at
  before update on public.entries
  for each row execute function update_updated_at();

-- profile自動作成trigger
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS有効化
alter table public.brands enable row level security;
alter table public.series enable row level security;
alter table public.tournaments enable row level security;
alter table public.entries enable row level security;
alter table public.profiles enable row level security;

-- brands RLS: 全員読み取り可、作成は認証済みユーザー
create policy "brands_select" on public.brands for select using (true);
create policy "brands_insert" on public.brands for insert with check (auth.uid() is not null);

-- series RLS: 公式(created_by=null)は全員、ユーザー作成は本人のみ
create policy "series_select" on public.series for select
  using (created_by is null or created_by = auth.uid());
create policy "series_insert" on public.series for insert
  with check (auth.uid() is not null and created_by = auth.uid());
create policy "series_update" on public.series for update
  using (created_by = auth.uid());
create policy "series_delete" on public.series for delete
  using (created_by = auth.uid());

-- tournaments RLS: 公式は全員、ユーザー作成は本人のみ
create policy "tournaments_select" on public.tournaments for select
  using (
    created_by is null or created_by = auth.uid()
  );
create policy "tournaments_insert" on public.tournaments for insert
  with check (auth.uid() is not null and created_by = auth.uid());
create policy "tournaments_update" on public.tournaments for update
  using (created_by = auth.uid());
create policy "tournaments_delete" on public.tournaments for delete
  using (created_by = auth.uid());

-- entries RLS: 本人のみ
create policy "entries_select" on public.entries for select
  using (user_id = auth.uid());
create policy "entries_insert" on public.entries for insert
  with check (user_id = auth.uid());
create policy "entries_update" on public.entries for update
  using (user_id = auth.uid());
create policy "entries_delete" on public.entries for delete
  using (user_id = auth.uid());

-- profiles RLS: 本人のみ
create policy "profiles_select" on public.profiles for select
  using (id = auth.uid());
create policy "profiles_update" on public.profiles for update
  using (id = auth.uid());
