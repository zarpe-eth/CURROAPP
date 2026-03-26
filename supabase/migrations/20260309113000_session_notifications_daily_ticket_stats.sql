alter table public.work_sessions
add column if not exists one_hour_notified boolean not null default false;

create table if not exists public.daily_ticket_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stat_date date not null,
  tickets_resolved integer not null default 0 check (tickets_resolved >= 0),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, stat_date)
);

create index if not exists daily_ticket_stats_user_date_idx
on public.daily_ticket_stats(user_id, stat_date desc);

alter table public.daily_ticket_stats enable row level security;

drop trigger if exists daily_ticket_stats_updated_at on public.daily_ticket_stats;
create trigger daily_ticket_stats_updated_at
before update on public.daily_ticket_stats
for each row execute function public.set_updated_at();

drop policy if exists "daily_ticket_stats_select_own_or_admin" on public.daily_ticket_stats;
create policy "daily_ticket_stats_select_own_or_admin"
on public.daily_ticket_stats
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "daily_ticket_stats_insert_admin_only" on public.daily_ticket_stats;
create policy "daily_ticket_stats_insert_admin_only"
on public.daily_ticket_stats
for insert
with check (public.is_admin(auth.uid()));

drop policy if exists "daily_ticket_stats_update_admin_only" on public.daily_ticket_stats;
create policy "daily_ticket_stats_update_admin_only"
on public.daily_ticket_stats
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
