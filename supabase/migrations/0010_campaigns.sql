-- Migration: campaigns, campaign_messages, campaign_analytics
-- Phase 1D.29

create table public.campaigns (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  name             text not null,
  template_id      text not null,
  segment          text not null default 'all',
  status           text not null default 'draft' check (status in ('draft','scheduled','sending','sent','failed')),
  scheduled_at     timestamptz,
  sent_at          timestamptz,
  recipient_count  integer,
  created_by       uuid references auth.users(id) on delete set null,
  deleted_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index campaigns_org_idx on public.campaigns (organization_id, created_at desc) where deleted_at is null;

create table public.campaign_messages (
  id           uuid primary key default gen_random_uuid(),
  campaign_id  uuid not null references public.campaigns(id) on delete cascade,
  customer_id  uuid not null references public.customers(id) on delete cascade,
  phone        text not null,
  status       text not null default 'pending' check (status in ('pending','sent','delivered','read','failed')),
  wa_message_id text,
  error_message text,
  sent_at      timestamptz,
  delivered_at timestamptz,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index campaign_messages_campaign_idx on public.campaign_messages (campaign_id);
create index campaign_messages_customer_idx on public.campaign_messages (customer_id);

create table public.campaign_analytics (
  id               uuid primary key default gen_random_uuid(),
  campaign_id      uuid not null unique references public.campaigns(id) on delete cascade,
  sent_count       integer not null default 0,
  delivered_count  integer not null default 0,
  read_count       integer not null default 0,
  failed_count     integer not null default 0,
  updated_at       timestamptz not null default now()
);

alter table public.campaigns enable row level security;
alter table public.campaign_messages enable row level security;
alter table public.campaign_analytics enable row level security;

create trigger campaigns_updated_at
  before update on public.campaigns
  for each row execute function public.set_updated_at();

-- RLS
create policy "campaigns_own_org" on public.campaigns
  for all using (organization_id = public.get_user_org_id());

create policy "campaign_messages_own_org" on public.campaign_messages
  for all using (
    campaign_id in (
      select id from public.campaigns where organization_id = public.get_user_org_id()
    )
  );

create policy "campaign_analytics_own_org" on public.campaign_analytics
  for select using (
    campaign_id in (
      select id from public.campaigns where organization_id = public.get_user_org_id()
    )
  );

-- Customer RLS
create policy "customers_own_org" on public.customers
  for all using (organization_id = public.get_user_org_id());

create policy "customer_visits_own_org" on public.customer_visits
  for all using (organization_id = public.get_user_org_id());

create policy "customer_consents_own_org" on public.customer_consents
  for all using (
    customer_id in (
      select id from public.customers where organization_id = public.get_user_org_id()
    )
  );
