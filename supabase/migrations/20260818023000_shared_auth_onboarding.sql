-- Use the shared SD Dialer Supabase Auth while creating isolated Parcendi profiles.

create or replace function parcendi_private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  partner_role_id uuid;
  headquarters_id uuid;
begin
  -- The Auth project is shared. Ignore registrations made by any other app.
  if coalesce(new.raw_user_meta_data ->> 'app_source', '') <> 'parcendi' then
    return new;
  end if;

  select id into partner_role_id from public.parcendi_roles where slug = 'parceiro' limit 1;
  select id into headquarters_id from public.parcendi_units where code = 'SEDE' limit 1;

  insert into public.parcendi_profiles
    (id, first_name, last_name, email, role, role_id, unit_id, is_active)
  values
    (new.id,
     coalesce(new.raw_user_meta_data ->> 'first_name', ''),
     coalesce(new.raw_user_meta_data ->> 'last_name', ''),
     new.email,
     'parceiro', partner_role_id, headquarters_id, true)
  on conflict (id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    email = excluded.email,
    is_active = true,
    updated_at = now();

  insert into public.usuarios
    (id, company_id, email, full_name, role, status)
  values
    (new.id,
     '02cbc41b-facd-4870-9bd0-91f74c4b0e1b'::uuid,
     new.email,
     btrim(concat(coalesce(new.raw_user_meta_data ->> 'first_name', ''), ' ',
                  coalesce(new.raw_user_meta_data ->> 'last_name', ''))),
     'parceiro', 'active')
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function parcendi_private.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists parcendi_auth_user_onboarding on auth.users;
create trigger parcendi_auth_user_onboarding
after insert on auth.users
for each row execute function parcendi_private.handle_new_auth_user();
