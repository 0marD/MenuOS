-- Migration: customers, customer_visits, customer_consents
-- Phase 1D.28

create table public.customers (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  name             text not null,
  phone_encrypted  text not null,
  phone_last4      text not null,
  segment          text not null default 'new' check (segment in ('new','frequent','dormant')),
  visit_count      integer not null default 0,
  last_visit_at    timestamptz,
  birthday         date,
  notes            text,
  is_opted_in      boolean not null default false,
  deleted_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index customers_org_idx on public.customers (organization_id) where deleted_at is null;
create index customers_segment_idx on public.customers (organization_id, segment) where deleted_at is null;
create index customers_phone_idx on public.customers (organization_id, phone_last4);

create table public.customer_visits (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid not null references public.customers(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  branch_id        uuid references public.branches(id) on delete set null,
  visited_at       timestamptz not null default now()
);

create index customer_visits_customer_idx on public.customer_visits (customer_id, visited_at desc);
create index customer_visits_org_idx on public.customer_visits (organization_id, visited_at desc);

create table public.customer_consents (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid not null references public.customers(id) on delete cascade,
  consent_type     text not null check (consent_type in ('marketing', 'data_processing')),
  granted          boolean not null,
  ip_address       inet,
  created_at       timestamptz not null default now()
);

create unique index customer_consents_unique on public.customer_consents (customer_id, consent_type);

alter table public.customers enable row level security;
alter table public.customer_visits enable row level security;
alter table public.customer_consents enable row level security;

create trigger customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- Auto-segment trigger
create or replace function public.update_customer_segment()
returns trigger language plpgsql as $$
begin
  update public.customers set
    visit_count = visit_count + 1,
    last_visit_at = now(),
    segment = case
      when visit_count + 1 >= 3 then 'frequent'
      else 'new'
    end
  where id = new.customer_id;
  return new;
end;
$$;

create trigger customer_visit_segment_update
  after insert on public.customer_visits
  for each row execute function public.update_customer_segment();
