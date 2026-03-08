alter table public.profiles
add column if not exists hourly_rate_eur numeric(8,2);

update public.profiles
set hourly_rate_eur = 8
where hourly_rate_eur is null;

alter table public.profiles
alter column hourly_rate_eur set default 8,
alter column hourly_rate_eur set not null;
