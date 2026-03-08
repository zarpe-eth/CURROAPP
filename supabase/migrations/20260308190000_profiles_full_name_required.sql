update public.profiles
set full_name = coalesce(nullif(full_name, ''), split_part(email, '@', 1), 'Usuario')
where full_name is null or full_name = '';

alter table public.profiles
alter column full_name set not null;
