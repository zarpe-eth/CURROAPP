create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  assigned_to uuid not null references public.profiles(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_assigned_to_idx on public.tasks(assigned_to);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_created_at_idx on public.tasks(created_at desc);

alter table public.tasks enable row level security;

create trigger tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create policy "tasks_select_own_or_admin"
on public.tasks
for select
using (auth.uid() = assigned_to or public.is_admin(auth.uid()));

create policy "tasks_insert_admin_only"
on public.tasks
for insert
with check (public.is_admin(auth.uid()) and created_by = auth.uid());

create policy "tasks_update_own_or_admin"
on public.tasks
for update
using (auth.uid() = assigned_to or public.is_admin(auth.uid()))
with check (auth.uid() = assigned_to or public.is_admin(auth.uid()));
