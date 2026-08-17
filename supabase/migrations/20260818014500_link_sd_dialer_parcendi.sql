-- Link only the Parcendi tenant from SD Dialer to the isolated Parcendi CRM.
-- Other SD Dialer companies and users are intentionally excluded.

alter table public.parcendi_leads
  add column if not exists external_source text,
  add column if not exists external_id uuid;

create unique index if not exists parcendi_leads_external_source_id_idx
  on public.parcendi_leads (external_source, external_id)
  where external_id is not null;

insert into public.parcendi_profiles
  (id, first_name, last_name, email, phone, role, role_id, unit_id, is_active)
select
  u.id,
  split_part(u.full_name, ' ', 1),
  coalesce(nullif(btrim(substr(u.full_name, length(split_part(u.full_name, ' ', 1)) + 1)), ''), ''),
  u.email,
  u.phone,
  case u.role
    when 'admin' then 'admin'
    when 'supervisor' then 'direcao'
    else 'parceiro'
  end,
  r.id,
  headquarters.id,
  u.status = 'active'
from public.usuarios u
join public.parcendi_roles r on r.slug = case u.role
  when 'admin' then 'admin'
  when 'supervisor' then 'direcao'
  else 'parceiro'
end
cross join lateral (
  select id from public.parcendi_units where code = 'SEDE' limit 1
) headquarters
where u.company_id = '02cbc41b-facd-4870-9bd0-91f74c4b0e1b'::uuid
on conflict (id) do update set
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  email = excluded.email,
  phone = excluded.phone,
  role = excluded.role,
  role_id = excluded.role_id,
  unit_id = excluded.unit_id,
  is_active = excluded.is_active,
  updated_at = now();

create or replace function parcendi_private.sync_dialer_lead()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parcendi_company constant uuid := '02cbc41b-facd-4870-9bd0-91f74c4b0e1b';
  headquarters_id uuid;
begin
  if tg_op = 'DELETE' then
    if old.company_id = parcendi_company then
      delete from public.parcendi_leads
      where external_source = 'sd_dialer' and external_id = old.id;
    end if;
    return old;
  end if;

  -- If a lead is moved away from Parcendi, remove only its synchronized copy.
  if tg_op = 'UPDATE' and old.company_id = parcendi_company and new.company_id <> parcendi_company then
    delete from public.parcendi_leads
    where external_source = 'sd_dialer' and external_id = old.id;
    return new;
  end if;

  if new.company_id <> parcendi_company then
    return new;
  end if;

  select id into headquarters_id
  from public.parcendi_units where code = 'SEDE' limit 1;

  insert into public.parcendi_leads
    (id, name, email, phone, origin, segment, assigned_to, unit_id, status,
     score, notes, rgpd_consent, rgpd_consent_date, source_campaign,
     created_at, updated_at, external_source, external_id)
  values
    (new.id, new.nome, new.email, new.telefone, coalesce(new.origem, 'sd_dialer'),
     'energia', case when exists (select 1 from public.parcendi_profiles p where p.id = new.assigned_to)
       then new.assigned_to else null end,
     headquarters_id, coalesce(new.status::text, 'nova'),
     new.priority, new.observacoes, coalesce(new.consentimento_rgpd, false),
     new.data_consentimento, new.campanha_id::text, new.created_at, new.updated_at,
     'sd_dialer', new.id)
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email,
    phone = excluded.phone,
    origin = excluded.origin,
    assigned_to = excluded.assigned_to,
    unit_id = excluded.unit_id,
    status = excluded.status,
    score = excluded.score,
    notes = excluded.notes,
    rgpd_consent = excluded.rgpd_consent,
    rgpd_consent_date = excluded.rgpd_consent_date,
    source_campaign = excluded.source_campaign,
    updated_at = excluded.updated_at,
    external_source = excluded.external_source,
    external_id = excluded.external_id;

  return new;
end;
$$;

revoke all on function parcendi_private.sync_dialer_lead() from public, anon, authenticated;

drop trigger if exists parcendi_sync_lead_to_crm on public.leads;
create trigger parcendi_sync_lead_to_crm
after insert or update or delete on public.leads
for each row execute function parcendi_private.sync_dialer_lead();

-- Initial synchronization of existing Parcendi leads.
insert into public.parcendi_leads
  (id, name, email, phone, origin, segment, assigned_to, unit_id, status,
   score, notes, rgpd_consent, rgpd_consent_date, source_campaign,
   created_at, updated_at, external_source, external_id)
select
  l.id, l.nome, l.email, l.telefone, coalesce(l.origem, 'sd_dialer'), 'energia',
  case when p.id is not null then l.assigned_to else null end,
  h.id, coalesce(l.status::text, 'nova'), l.priority, l.observacoes,
  coalesce(l.consentimento_rgpd, false), l.data_consentimento, l.campanha_id::text,
  l.created_at, l.updated_at, 'sd_dialer', l.id
from public.leads l
cross join lateral (select id from public.parcendi_units where code = 'SEDE' limit 1) h
left join public.parcendi_profiles p on p.id = l.assigned_to
where l.company_id = '02cbc41b-facd-4870-9bd0-91f74c4b0e1b'::uuid
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone,
  origin = excluded.origin,
  assigned_to = excluded.assigned_to,
  unit_id = excluded.unit_id,
  status = excluded.status,
  score = excluded.score,
  notes = excluded.notes,
  rgpd_consent = excluded.rgpd_consent,
  rgpd_consent_date = excluded.rgpd_consent_date,
  source_campaign = excluded.source_campaign,
  updated_at = excluded.updated_at,
  external_source = excluded.external_source,
  external_id = excluded.external_id;
