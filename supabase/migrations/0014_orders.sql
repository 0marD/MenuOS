-- Migration: restaurant_tables, orders, order_items, order_status_history
-- Phase 2.1

-- Restaurant tables (mesas)
create table public.restaurant_tables (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  branch_id        uuid not null references public.branches(id) on delete cascade,
  number           smallint not null,
  label            text,                          -- "Mesa 1", "Barra", "Terraza 3"
  zone             text,                          -- "interior", "terraza", "barra"
  capacity         smallint default 4,
  is_active        boolean not null default true,
  qr_token         text unique default gen_random_uuid()::text,
  deleted_at       timestamptz,
  created_at       timestamptz not null default now(),
  constraint restaurant_tables_unique unique (branch_id, number)
);

create index rt_org_idx on public.restaurant_tables (organization_id) where deleted_at is null;
create index rt_branch_idx on public.restaurant_tables (branch_id) where deleted_at is null;
alter table public.restaurant_tables enable row level security;

-- Orders
create table public.orders (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  branch_id        uuid not null references public.branches(id) on delete cascade,
  table_id         uuid references public.restaurant_tables(id) on delete set null,
  table_number     smallint,                      -- denormalized for display
  status           text not null default 'pending'
                   check (status in ('pending','confirmed','preparing','ready','delivered','cancelled')),
  notes            text,
  total            numeric(10,2) not null default 0,
  customer_name    text,
  round            smallint not null default 1,   -- ronda de pedido
  confirmed_by     uuid references public.staff_users(id) on delete set null,
  confirmed_at     timestamptz,
  ready_at         timestamptz,
  delivered_at     timestamptz,
  cancelled_at     timestamptz,
  cancel_reason    text,
  deleted_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index orders_org_status_idx on public.orders (organization_id, status, created_at desc)
  where deleted_at is null;
create index orders_branch_idx on public.orders (branch_id, status, created_at desc)
  where deleted_at is null;
create index orders_table_idx on public.orders (table_id, created_at desc)
  where deleted_at is null;

alter table public.orders enable row level security;

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Order items
create table public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders(id) on delete cascade,
  menu_item_id     uuid not null references public.menu_items(id) on delete restrict,
  name             text not null,                 -- snapshot at time of order
  price            numeric(10,2) not null,        -- snapshot at time of order
  quantity         smallint not null default 1 check (quantity > 0),
  notes            text,
  is_ready         boolean not null default false,
  created_at       timestamptz not null default now()
);

create index order_items_order_idx on public.order_items (order_id);
alter table public.order_items enable row level security;

-- Order status history (audit trail)
create table public.order_status_history (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders(id) on delete cascade,
  status           text not null,
  changed_by       uuid references public.staff_users(id) on delete set null,
  note             text,
  created_at       timestamptz not null default now()
);

create index order_status_history_order_idx on public.order_status_history (order_id, created_at desc);
alter table public.order_status_history enable row level security;

-- RLS Policies

-- restaurant_tables: staff reads own org; public read by qr_token handled via API
create policy "rt_select_staff" on public.restaurant_tables
  for select using (organization_id = public.get_user_org_id());

create policy "rt_insert_admin" on public.restaurant_tables
  for insert with check (
    organization_id = public.get_user_org_id()
    and public.get_user_role() in ('super_admin','manager')
  );

create policy "rt_update_admin" on public.restaurant_tables
  for update using (
    organization_id = public.get_user_org_id()
    and public.get_user_role() in ('super_admin','manager')
  );

-- Allow anon select by qr_token (for customer ordering)
create policy "rt_select_public" on public.restaurant_tables
  for select using (is_active = true and deleted_at is null);

-- orders: staff reads own org
create policy "orders_select_staff" on public.orders
  for select using (organization_id = public.get_user_org_id());

create policy "orders_insert_staff" on public.orders
  for insert with check (organization_id = public.get_user_org_id());

-- Allow anon insert (customer placing order)
create policy "orders_insert_anon" on public.orders
  for insert with check (true);

create policy "orders_update_staff" on public.orders
  for update using (organization_id = public.get_user_org_id());

-- Allow anon select own order by id (customer tracks status)
create policy "orders_select_anon" on public.orders
  for select using (true);

-- order_items
create policy "order_items_select_staff" on public.order_items
  for select using (
    order_id in (select id from public.orders where organization_id = public.get_user_org_id())
  );

create policy "order_items_insert_anon" on public.order_items
  for insert with check (true);

create policy "order_items_update_staff" on public.order_items
  for update using (
    order_id in (select id from public.orders where organization_id = public.get_user_org_id())
  );

-- order_status_history
create policy "osh_select_staff" on public.order_status_history
  for select using (
    order_id in (select id from public.orders where organization_id = public.get_user_org_id())
  );

create policy "osh_insert" on public.order_status_history
  for insert with check (true);
