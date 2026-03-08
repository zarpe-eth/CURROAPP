-- CURROAPP schema (Supabase PostgreSQL)
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text not null,
  hourly_rate_eur numeric(8,2) not null default 8,
  role text not null default 'employee' check (role in ('admin', 'employee')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  duration_seconds integer,
  money_earned numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists work_sessions_user_idx on public.work_sessions(user_id, started_at desc);
create index if not exists work_sessions_status_idx on public.work_sessions(status);

create table if not exists public.work_breaks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.work_sessions(id) on delete cascade,
  break_start timestamptz not null,
  break_end timestamptz,
  duration_seconds integer,
  created_at timestamptz not null default now()
);

create index if not exists work_breaks_session_idx on public.work_breaks(session_id, break_start);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  hourly_rate_eur numeric(8,2) not null default 8,
  timezone text not null default 'Europe/Madrid',
  employee_display_name text not null default 'Javi',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ticket_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stat_date date not null,
  tickets_responded integer not null default 0,
  tickets_month_total integer not null default 0,
  avg_time_per_ticket_seconds numeric(10,2) not null default 0,
  tickets_per_hour numeric(10,2) not null default 0,
  source text not null default 'tidio',
  created_at timestamptz not null default now(),
  unique (user_id, stat_date)
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger work_sessions_updated_at
before update on public.work_sessions
for each row execute function public.set_updated_at();

create trigger app_settings_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, hourly_rate_eur, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    8,
    case when new.email = 'silvestelar@gmail.com' then 'admin' else 'employee' end
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    hourly_rate_eur = coalesce(profiles.hourly_rate_eur, excluded.hourly_rate_eur),
    role = case when excluded.email = 'silvestelar@gmail.com' then 'admin' else profiles.role end,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.work_sessions enable row level security;
alter table public.work_breaks enable row level security;
alter table public.app_settings enable row level security;
alter table public.ticket_stats enable row level security;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.profiles p
    where p.id = uid
      and (p.role = 'admin' or p.email = 'silvestelar@gmail.com')
  );
$$;

-- Profiles
create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "profiles_update_own_or_admin"
on public.profiles
for update
using (auth.uid() = id or public.is_admin(auth.uid()))
with check (auth.uid() = id or public.is_admin(auth.uid()));

-- Work sessions
create policy "work_sessions_select_own_or_admin"
on public.work_sessions
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "work_sessions_insert_own_or_admin"
on public.work_sessions
for insert
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "work_sessions_update_own_or_admin"
on public.work_sessions
for update
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Work breaks
create policy "work_breaks_select_own_or_admin"
on public.work_breaks
for select
using (
  exists (
    select 1
    from public.work_sessions ws
    where ws.id = work_breaks.session_id
      and (ws.user_id = auth.uid() or public.is_admin(auth.uid()))
  )
);

create policy "work_breaks_insert_own_or_admin"
on public.work_breaks
for insert
with check (
  exists (
    select 1
    from public.work_sessions ws
    where ws.id = work_breaks.session_id
      and (ws.user_id = auth.uid() or public.is_admin(auth.uid()))
  )
);

create policy "work_breaks_update_own_or_admin"
on public.work_breaks
for update
using (
  exists (
    select 1
    from public.work_sessions ws
    where ws.id = work_breaks.session_id
      and (ws.user_id = auth.uid() or public.is_admin(auth.uid()))
  )
)
with check (
  exists (
    select 1
    from public.work_sessions ws
    where ws.id = work_breaks.session_id
      and (ws.user_id = auth.uid() or public.is_admin(auth.uid()))
  )
);

-- App settings
create policy "app_settings_read_all_authenticated"
on public.app_settings
for select
using (auth.uid() is not null);

create policy "app_settings_admin_insert"
on public.app_settings
for insert
with check (public.is_admin(auth.uid()));

create policy "app_settings_admin_update"
on public.app_settings
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Ticket stats
create policy "ticket_stats_select_own_or_admin"
on public.ticket_stats
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "ticket_stats_insert_own_or_admin"
on public.ticket_stats
for insert
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "ticket_stats_update_own_or_admin"
on public.ticket_stats
for update
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

insert into public.app_settings (hourly_rate_eur, timezone, employee_display_name)
select 8, 'Europe/Madrid', 'Javi'
where not exists (select 1 from public.app_settings);

