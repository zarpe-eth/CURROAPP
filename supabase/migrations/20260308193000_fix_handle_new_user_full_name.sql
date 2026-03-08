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
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'Usuario'),
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
