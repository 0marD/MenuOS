-- Migration: Loyalty programs, stamp cards, stamps, rewards
-- Phase 3.1–3.2

-- Loyalty programs (one active per org)
create table public.loyalty_programs (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  name             text not null,
  stamps_required  smallint not null default 8 check (stamps_required between 5 and 12),
  reward_type      text not null check (reward_type in ('free_item','discount','custom')),
  reward_value     text not null,                  -- e.g. "Café gratis" or "20%"
  expiration_days  integer,                        -- null = no expiry
  is_active        boolean not null default true,
  deleted_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index loyalty_programs_org_idx on public.loyalty_programs (organization_id) where deleted_at is null;
alter table public.loyalty_programs enable row level security;
create trigger loyalty_programs_updated_at
  before update on public.loyalty_programs
  for each row execute function public.set_updated_at();

-- Stamp cards (one per customer per program)
create table public.stamp_cards (
  id               uuid primary key default gen_random_uuid(),
  program_id       uuid not null references public.loyalty_programs(id) on delete cascade,
  customer_id      uuid not null references public.customers(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  stamp_count      smallint not null default 0,
  is_complete      boolean not null default false,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint stamp_cards_unique unique (program_id, customer_id)
);

create index stamp_cards_customer_idx on public.stamp_cards (customer_id);
create index stamp_cards_org_idx on public.stamp_cards (organization_id);
alter table public.stamp_cards enable row level security;
create trigger stamp_cards_updated_at
  before update on public.stamp_cards
  for each row execute function public.set_updated_at();

-- Individual stamps
create table public.stamps (
  id               uuid primary key default gen_random_uuid(),
  stamp_card_id    uuid not null references public.stamp_cards(id) on delete cascade,
  customer_id      uuid not null references public.customers(id) on delete cascade,
  branch_id        uuid references public.branches(id) on delete set null,
  granted_by       uuid references public.staff_users(id) on delete set null,
  stamped_at       timestamptz not null default now()
);

-- Fraud prevention: 1 stamp per customer per branch per day
create unique index stamps_daily_unique
  on public.stamps (customer_id, branch_id, (stamped_at::date))
  where branch_id is not null;

create index stamps_card_idx on public.stamps (stamp_card_id, stamped_at desc);
alter table public.stamps enable row level security;

-- Rewards
create table public.rewards (
  id               uuid primary key default gen_random_uuid(),
  stamp_card_id    uuid not null references public.stamp_cards(id) on delete cascade,
  customer_id      uuid not null references public.customers(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  code             text not null unique,           -- unique redemption code
  redeemed_at      timestamptz,
  expires_at       timestamptz,
  created_at       timestamptz not null default now()
);

create index rewards_customer_idx on public.rewards (customer_id);
create index rewards_code_idx on public.rewards (code);
alter table public.rewards enable row level security;

-- RLS policies

-- loyalty_programs: staff reads own org
create policy "loyalty_programs_select" on public.loyalty_programs
  for select using (organization_id = public.get_user_org_id());

create policy "loyalty_programs_insert_admin" on public.loyalty_programs
  for insert with check (
    organization_id = public.get_user_org_id()
    and public.get_user_role() in ('super_admin', 'manager')
  );

create policy "loyalty_programs_update_admin" on public.loyalty_programs
  for update using (
    organization_id = public.get_user_org_id()
    and public.get_user_role() in ('super_admin', 'manager')
  );

-- stamp_cards: staff reads own org; customer reads own
create policy "stamp_cards_select_staff" on public.stamp_cards
  for select using (organization_id = public.get_user_org_id());

create policy "stamp_cards_insert" on public.stamp_cards
  for insert with check (organization_id = public.get_user_org_id());

create policy "stamp_cards_update_staff" on public.stamp_cards
  for update using (organization_id = public.get_user_org_id());

-- stamps: waiter/kitchen can insert; staff reads
create policy "stamps_select_staff" on public.stamps
  for select using (
    stamp_card_id in (
      select id from public.stamp_cards
      where organization_id = public.get_user_org_id()
    )
  );

create policy "stamps_insert_staff" on public.stamps
  for insert with check (
    stamp_card_id in (
      select id from public.stamp_cards
      where organization_id = public.get_user_org_id()
    )
  );

-- rewards: staff reads own org
create policy "rewards_select_staff" on public.rewards
  for select using (organization_id = public.get_user_org_id());

create policy "rewards_insert_staff" on public.rewards
  for insert with check (organization_id = public.get_user_org_id());

create policy "rewards_update_staff" on public.rewards
  for update using (organization_id = public.get_user_org_id());
