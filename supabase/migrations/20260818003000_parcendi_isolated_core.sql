-- PARCENDi isolated CRM schema inside the shared SD Dialer Supabase project.
-- All application tables are prefixed with parcendi_ so existing SD Dialer
-- tables, relationships and data remain untouched.

create schema if not exists parcendi_private;
revoke all on schema parcendi_private from public, anon;
grant usage on schema parcendi_private to authenticated;

create or replace function parcendi_private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.parcendi_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  parent_role_id uuid references public.parcendi_roles(id) on delete set null,
  hierarchy_level integer not null default 0 check (hierarchy_level >= 0),
  is_system boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parcendi_permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  module text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.parcendi_role_permissions (
  role_id uuid not null references public.parcendi_roles(id) on delete cascade,
  permission_id uuid not null references public.parcendi_permissions(id) on delete cascade,
  allowed boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.parcendi_units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  type text not null default 'agencia' check (type in ('sede','franquia','parceiro','agencia')),
  parent_unit_id uuid references public.parcendi_units(id) on delete set null,
  manager_id uuid,
  address text,
  city text,
  postal_code text,
  phone text,
  email text,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parcendi_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  email text,
  phone text,
  avatar_url text,
  role text not null default 'especialista' check (role in ('superadmin','admin','ceo','direcao','operadora','especialista','unidade','franquia','parceiro')),
  role_id uuid references public.parcendi_roles(id) on delete set null,
  unit_id uuid references public.parcendi_units(id) on delete set null,
  is_active boolean not null default true,
  nif text,
  iban text,
  commission_rate numeric(7,4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.parcendi_units
  drop constraint if exists parcendi_units_manager_id_fkey;
alter table public.parcendi_units
  add constraint parcendi_units_manager_id_fkey foreign key (manager_id)
  references public.parcendi_profiles(id) on delete set null;

create or replace function parcendi_private.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.parcendi_profiles p
    where p.id = (select auth.uid()) and p.is_active
  );
$$;
revoke all on function parcendi_private.is_member() from public, anon;
grant execute on function parcendi_private.is_member() to authenticated;

create table if not exists public.parcendi_pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  segment text not null check (segment in ('energia','telecom','credito','imobiliario','seguros')),
  name text not null,
  position integer not null default 0,
  color text not null default '#64748B',
  is_won boolean not null default false,
  is_lost boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (segment, name)
);

create table if not exists public.parcendi_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  nif text,
  address text,
  city text,
  postal_code text,
  notes text,
  assigned_to uuid references public.parcendi_profiles(id) on delete set null,
  unit_id uuid references public.parcendi_units(id) on delete set null,
  is_active boolean not null default true,
  rgpd_consent boolean not null default false,
  rgpd_consent_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parcendi_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  origin text not null default 'manual',
  segment text not null default 'energia' check (segment in ('energia','telecom','credito','imobiliario','seguros')),
  assigned_to uuid references public.parcendi_profiles(id) on delete set null,
  unit_id uuid references public.parcendi_units(id) on delete set null,
  client_id uuid references public.parcendi_clients(id) on delete set null,
  status text not null default 'nova',
  score integer,
  notes text,
  rgpd_consent boolean not null default false,
  rgpd_consent_date timestamptz,
  source_campaign text,
  source_medium text,
  converted boolean not null default false,
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parcendi_deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_id uuid references public.parcendi_clients(id) on delete set null,
  lead_id uuid references public.parcendi_leads(id) on delete set null,
  segment text not null check (segment in ('energia','telecom','credito','imobiliario','seguros')),
  stage text not null default 'nova_lead',
  stage_id uuid references public.parcendi_pipeline_stages(id) on delete set null,
  assigned_to uuid references public.parcendi_profiles(id) on delete set null,
  unit_id uuid references public.parcendi_units(id) on delete set null,
  value numeric(14,2),
  commission_value numeric(14,2),
  contract_start_date date,
  contract_end_date date,
  renewal_date date,
  notes text,
  closed_at timestamptz,
  lost_reason text,
  is_renewal boolean not null default false,
  parent_deal_id uuid references public.parcendi_deals(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parcendi_deal_history (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.parcendi_deals(id) on delete cascade,
  from_stage text,
  to_stage text not null,
  changed_by uuid references public.parcendi_profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.parcendi_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'pendente',
  priority text not null default 'media',
  assigned_to uuid references public.parcendi_profiles(id) on delete set null,
  created_by uuid references public.parcendi_profiles(id) on delete set null,
  deal_id uuid references public.parcendi_deals(id) on delete cascade,
  lead_id uuid references public.parcendi_leads(id) on delete cascade,
  client_id uuid references public.parcendi_clients(id) on delete cascade,
  due_date timestamptz,
  completed_at timestamptz,
  is_automated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parcendi_documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  file_url text not null,
  file_type text,
  file_size bigint,
  status text not null default 'pendente',
  client_id uuid references public.parcendi_clients(id) on delete cascade,
  deal_id uuid references public.parcendi_deals(id) on delete cascade,
  lead_id uuid references public.parcendi_leads(id) on delete cascade,
  uploaded_by uuid references public.parcendi_profiles(id) on delete set null,
  validated_by uuid references public.parcendi_profiles(id) on delete set null,
  validated_at timestamptz,
  expires_at timestamptz,
  notes text,
  rgpd_delete_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parcendi_commission_configs (
  id uuid primary key default gen_random_uuid(),
  segment text not null check (segment in ('energia','telecom','credito','imobiliario','seguros')),
  role text not null,
  percentage numeric(7,4) not null default 0,
  franquia_percentage numeric(7,4),
  marketing_percentage numeric(7,4),
  impacto_social_percentage numeric(7,4),
  recrutamento_percentage numeric(7,4),
  is_active boolean not null default true,
  created_by uuid references public.parcendi_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (segment, role)
);

create table if not exists public.parcendi_commission_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  segment text not null check (segment in ('energia','telecom','credito','imobiliario','seguros')),
  scope_type text not null check (scope_type in ('global','role','unit','user')),
  role_id uuid references public.parcendi_roles(id) on delete cascade,
  unit_id uuid references public.parcendi_units(id) on delete cascade,
  profile_id uuid references public.parcendi_profiles(id) on delete cascade,
  percentage numeric(7,4) not null default 0,
  fixed_value numeric(14,2),
  priority integer not null default 0,
  valid_from date,
  valid_until date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parcendi_commissions (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.parcendi_deals(id) on delete cascade,
  profile_id uuid not null references public.parcendi_profiles(id) on delete cascade,
  status text not null default 'prevista',
  gross_value numeric(14,2) not null default 0,
  net_value numeric(14,2) not null default 0,
  percentage numeric(7,4) not null default 0,
  origin text,
  executor_id uuid references public.parcendi_profiles(id) on delete set null,
  franquia_value numeric(14,2),
  marketing_value numeric(14,2),
  impacto_social_value numeric(14,2),
  recrutamento_value numeric(14,2),
  validated_by uuid references public.parcendi_profiles(id) on delete set null,
  validated_at timestamptz,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parcendi_cross_sells (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.parcendi_clients(id) on delete cascade,
  origin_deal_id uuid references public.parcendi_deals(id) on delete set null,
  new_deal_id uuid references public.parcendi_deals(id) on delete set null,
  segment text not null,
  status text not null default 'aberto',
  assigned_to uuid references public.parcendi_profiles(id) on delete set null,
  created_by uuid references public.parcendi_profiles(id) on delete set null,
  potential_value numeric(14,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parcendi_renewals (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.parcendi_deals(id) on delete cascade,
  client_id uuid not null references public.parcendi_clients(id) on delete cascade,
  segment text not null,
  status text not null default 'ativo',
  contract_end_date date not null,
  renewal_date date,
  assigned_to uuid references public.parcendi_profiles(id) on delete set null,
  unit_id uuid references public.parcendi_units(id) on delete set null,
  notified_30d boolean not null default false,
  notified_60d boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parcendi_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  type text not null default 'individual',
  nif text,
  iban text,
  unit_id uuid references public.parcendi_units(id) on delete set null,
  profile_id uuid references public.parcendi_profiles(id) on delete set null,
  commission_rate numeric(7,4),
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parcendi_notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.parcendi_profiles(id) on delete cascade,
  type text not null default 'system',
  title text not null,
  message text not null,
  is_read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create table if not exists public.parcendi_audit_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.parcendi_profiles(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.parcendi_contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  segment text,
  message text,
  origin text,
  page text,
  rgpd_consent boolean not null default false,
  processed boolean not null default false,
  lead_id uuid references public.parcendi_leads(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.parcendi_whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.parcendi_clients(id) on delete cascade,
  lead_id uuid references public.parcendi_leads(id) on delete cascade,
  phone text not null,
  direction text not null check (direction in ('inbound','outbound')),
  message text not null,
  template text,
  status text,
  sent_by uuid references public.parcendi_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.parcendi_energy_tariffs (
  id uuid primary key default gen_random_uuid(),
  supplier text not null,
  plan_name text not null,
  tariff_type text not null default 'simples',
  power_kva numeric(8,2),
  energy_price_kwh numeric(12,6) not null,
  daily_fixed_price numeric(12,6) not null default 0,
  source_url text,
  valid_from date not null default current_date,
  valid_until date,
  last_verified_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (supplier, plan_name, tariff_type, power_kva, valid_from)
);

-- PostgreSQL does not index foreign keys automatically. These indexes keep
-- joins, RLS membership checks and cascading deletes predictable as the CRM grows.
create index if not exists parcendi_profiles_role_id_idx on public.parcendi_profiles(role_id);
create index if not exists parcendi_profiles_unit_id_idx on public.parcendi_profiles(unit_id);
create index if not exists parcendi_units_parent_unit_id_idx on public.parcendi_units(parent_unit_id);
create index if not exists parcendi_units_manager_id_idx on public.parcendi_units(manager_id);
create index if not exists parcendi_role_permissions_permission_id_idx on public.parcendi_role_permissions(permission_id);
create index if not exists parcendi_leads_assigned_to_idx on public.parcendi_leads(assigned_to);
create index if not exists parcendi_leads_unit_id_idx on public.parcendi_leads(unit_id);
create index if not exists parcendi_leads_client_id_idx on public.parcendi_leads(client_id);
create index if not exists parcendi_leads_segment_status_idx on public.parcendi_leads(segment, status);
create index if not exists parcendi_clients_assigned_to_idx on public.parcendi_clients(assigned_to);
create index if not exists parcendi_clients_unit_id_idx on public.parcendi_clients(unit_id);
create index if not exists parcendi_deals_client_id_idx on public.parcendi_deals(client_id);
create index if not exists parcendi_deals_lead_id_idx on public.parcendi_deals(lead_id);
create index if not exists parcendi_deals_stage_id_idx on public.parcendi_deals(stage_id);
create index if not exists parcendi_deals_assigned_to_idx on public.parcendi_deals(assigned_to);
create index if not exists parcendi_deals_unit_id_idx on public.parcendi_deals(unit_id);
create index if not exists parcendi_deals_segment_stage_idx on public.parcendi_deals(segment, stage);
create index if not exists parcendi_deal_history_deal_id_idx on public.parcendi_deal_history(deal_id);
create index if not exists parcendi_tasks_assigned_to_idx on public.parcendi_tasks(assigned_to);
create index if not exists parcendi_tasks_deal_id_idx on public.parcendi_tasks(deal_id);
create index if not exists parcendi_tasks_lead_id_idx on public.parcendi_tasks(lead_id);
create index if not exists parcendi_tasks_client_id_idx on public.parcendi_tasks(client_id);
create index if not exists parcendi_documents_client_id_idx on public.parcendi_documents(client_id);
create index if not exists parcendi_documents_deal_id_idx on public.parcendi_documents(deal_id);
create index if not exists parcendi_documents_lead_id_idx on public.parcendi_documents(lead_id);
create index if not exists parcendi_commissions_deal_id_idx on public.parcendi_commissions(deal_id);
create index if not exists parcendi_commissions_profile_id_idx on public.parcendi_commissions(profile_id);
create index if not exists parcendi_cross_sells_client_id_idx on public.parcendi_cross_sells(client_id);
create index if not exists parcendi_renewals_deal_id_idx on public.parcendi_renewals(deal_id);
create index if not exists parcendi_renewals_client_id_idx on public.parcendi_renewals(client_id);
create index if not exists parcendi_notifications_profile_id_idx on public.parcendi_notifications(profile_id);
create index if not exists parcendi_pipeline_stages_segment_position_idx on public.parcendi_pipeline_stages(segment, position);
create index if not exists parcendi_energy_tariffs_active_validity_idx on public.parcendi_energy_tariffs(is_active, valid_until);

-- Seed configurable role hierarchy and permission catalogue.
insert into public.parcendi_roles (name, slug, description, hierarchy_level, is_system)
values
  ('Superadministrador','superadmin','Acesso total à plataforma',0,true),
  ('Administrador','admin','Administração operacional',1,true),
  ('CEO','ceo','Direção executiva',1,true),
  ('Direção','direcao','Gestão de equipas e unidades',2,true),
  ('Operadora','operadora','Operação e validação',3,true),
  ('Especialista','especialista','Gestão comercial',4,true),
  ('Unidade','unidade','Gestão de unidade',3,true),
  ('Franquia','franquia','Gestão de franquia',3,true),
  ('Parceiro','parceiro','Acesso de parceiro',5,true)
on conflict (slug) do nothing;

update public.parcendi_roles child
set parent_role_id = parent.id
from public.parcendi_roles parent
where (child.slug, parent.slug) in (
  ('admin','superadmin'),('ceo','superadmin'),('direcao','ceo'),
  ('operadora','direcao'),('especialista','direcao'),('unidade','direcao'),
  ('franquia','direcao'),('parceiro','unidade')
);

insert into public.parcendi_permissions (code, name, module)
values
  ('users.view','Ver utilizadores','utilizadores'),
  ('users.manage','Gerir utilizadores','utilizadores'),
  ('roles.manage','Gerir cargos e permissões','utilizadores'),
  ('units.view','Ver unidades','unidades'),
  ('units.manage','Gerir unidades','unidades'),
  ('leads.view','Ver leads','leads'),
  ('leads.manage','Gerir leads','leads'),
  ('deals.view','Ver negócios','negocios'),
  ('deals.manage','Gerir negócios','negocios'),
  ('pipelines.manage','Gerir etapas do pipeline','pipelines'),
  ('commissions.view','Ver comissões','comissoes'),
  ('commissions.manage','Gerir regras de comissões','comissoes'),
  ('documents.view','Ver documentos','documentos'),
  ('documents.manage','Gerir documentos','documentos'),
  ('energy.manage','Gerir tarifários de energia','energia'),
  ('settings.manage','Gerir configurações','configuracoes'),
  ('audit.view','Ver auditoria','auditoria')
on conflict (code) do nothing;

insert into public.parcendi_pipeline_stages (segment, name, position, color, is_won, is_lost)
select segment, name, position, color, is_won, is_lost
from (values
  ('energia','Nova Lead',0,'#F59E0B',false,false),
  ('energia','Contactar',1,'#3B82F6',false,false),
  ('energia','Em Análise',2,'#8B5CF6',false,false),
  ('energia','Contrato Fechado',3,'#10B981',true,false),
  ('energia','Perdido',4,'#EF4444',false,true),
  ('telecom','Nova Lead',0,'#F59E0B',false,false),
  ('telecom','Contactar',1,'#3B82F6',false,false),
  ('telecom','Proposta',2,'#8B5CF6',false,false),
  ('telecom','Contrato Fechado',3,'#10B981',true,false),
  ('telecom','Perdido',4,'#EF4444',false,true),
  ('credito','Nova Lead',0,'#F59E0B',false,false),
  ('credito','Documentação',1,'#3B82F6',false,false),
  ('credito','Em Análise',2,'#8B5CF6',false,false),
  ('credito','Aprovado',3,'#10B981',true,false),
  ('credito','Recusado',4,'#EF4444',false,true),
  ('imobiliario','Nova Lead',0,'#F59E0B',false,false),
  ('imobiliario','Qualificação',1,'#3B82F6',false,false),
  ('imobiliario','Proposta',2,'#8B5CF6',false,false),
  ('imobiliario','Fechado',3,'#10B981',true,false),
  ('imobiliario','Perdido',4,'#EF4444',false,true),
  ('seguros','Nova Lead',0,'#F59E0B',false,false),
  ('seguros','Análise',1,'#3B82F6',false,false),
  ('seguros','Proposta',2,'#8B5CF6',false,false),
  ('seguros','Apólice Emitida',3,'#10B981',true,false),
  ('seguros','Perdido',4,'#EF4444',false,true)
) as seed(segment,name,position,color,is_won,is_lost)
on conflict (segment, name) do nothing;

insert into public.parcendi_units
  (name, code, type, address, city, postal_code, phone, email, position)
values
  ('Sede PARCENDi','SEDE','sede','Rua Nova do Seixo 964','São Mamede de Infesta','4465-202','961383587',null,0)
on conflict (code) do update set
  address = excluded.address,
  city = excluded.city,
  postal_code = excluded.postal_code,
  phone = excluded.phone;

-- Enable RLS on every exposed PARCENDi table.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'parcendi_roles','parcendi_permissions','parcendi_role_permissions',
    'parcendi_units','parcendi_profiles','parcendi_pipeline_stages',
    'parcendi_clients','parcendi_leads','parcendi_deals','parcendi_deal_history',
    'parcendi_tasks','parcendi_documents','parcendi_commission_configs',
    'parcendi_commission_rules','parcendi_commissions','parcendi_cross_sells',
    'parcendi_renewals','parcendi_partners','parcendi_notifications',
    'parcendi_audit_logs','parcendi_contact_submissions',
    'parcendi_whatsapp_messages','parcendi_energy_tariffs'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists parcendi_member_all on public.%I', table_name);
    execute format(
      'create policy parcendi_member_all on public.%I for all to authenticated using ((select parcendi_private.is_member())) with check ((select parcendi_private.is_member()))',
      table_name
    );
  end loop;
end $$;

-- Public website forms may only create contact submissions.
drop policy if exists parcendi_public_contact_insert on public.parcendi_contact_submissions;
create policy parcendi_public_contact_insert
on public.parcendi_contact_submissions for insert to anon
with check (rgpd_consent = true);

-- Public simulator may read only currently active tariffs.
drop policy if exists parcendi_public_tariffs_read on public.parcendi_energy_tariffs;
create policy parcendi_public_tariffs_read
on public.parcendi_energy_tariffs for select to anon
using (is_active and (valid_until is null or valid_until >= current_date));

-- A signed-in user can read their own membership row before is_member() succeeds.
drop policy if exists parcendi_profile_self_read on public.parcendi_profiles;
create policy parcendi_profile_self_read
on public.parcendi_profiles for select to authenticated
using (id = (select auth.uid()));

-- Keep updated_at consistent.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'parcendi_roles','parcendi_units','parcendi_profiles','parcendi_pipeline_stages',
    'parcendi_clients','parcendi_leads','parcendi_deals','parcendi_tasks',
    'parcendi_documents','parcendi_commission_configs','parcendi_commission_rules',
    'parcendi_commissions','parcendi_cross_sells','parcendi_renewals',
    'parcendi_partners','parcendi_energy_tariffs'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function parcendi_private.set_updated_at()',
      table_name
    );
  end loop;
end $$;

-- Grant only the prefixed tables. Never change privileges on SD Dialer tables.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'parcendi_roles','parcendi_permissions','parcendi_role_permissions',
    'parcendi_units','parcendi_profiles','parcendi_pipeline_stages',
    'parcendi_clients','parcendi_leads','parcendi_deals','parcendi_deal_history',
    'parcendi_tasks','parcendi_documents','parcendi_commission_configs',
    'parcendi_commission_rules','parcendi_commissions','parcendi_cross_sells',
    'parcendi_renewals','parcendi_partners','parcendi_notifications',
    'parcendi_audit_logs','parcendi_contact_submissions',
    'parcendi_whatsapp_messages','parcendi_energy_tariffs'
  ]
  loop
    execute format(
      'grant select, insert, update, delete on table public.%I to authenticated',
      table_name
    );
  end loop;
end $$;
grant insert on public.parcendi_contact_submissions to anon;
grant select on public.parcendi_energy_tariffs to anon;
