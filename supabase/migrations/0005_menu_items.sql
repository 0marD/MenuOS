-- Migration: menu_items, menu_item_photos, menu_item_filters, menu_item_branch_overrides
-- Phase 0.14, 0.15

create table public.menu_items (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  category_id      uuid not null references public.menu_categories(id) on delete cascade,
  name             text not null,
  description      text,
  price            numeric(10,2) not null check (price >= 0),
  is_available     boolean not null default true,
  is_sold_out_today boolean not null default false,
  sort_order       integer not null default 0,
  prep_time        integer check (prep_time >= 0 and prep_time <= 120),
  is_special       boolean not null default false,
  deleted_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index menu_items_category_idx on public.menu_items (category_id, sort_order) where deleted_at is null;
create index menu_items_org_idx on public.menu_items (organization_id) where deleted_at is null;

create table public.menu_item_photos (
  id            uuid primary key default gen_random_uuid(),
  menu_item_id  uuid not null references public.menu_items(id) on delete cascade,
  url           text not null,
  position      integer not null default 0,
  created_at    timestamptz not null default now()
);

create index menu_item_photos_item_idx on public.menu_item_photos (menu_item_id);

create table public.menu_item_filters (
  id            uuid primary key default gen_random_uuid(),
  menu_item_id  uuid not null references public.menu_items(id) on delete cascade,
  filter        text not null check (filter in ('vegetariano','sin_gluten','picante','vegano'))
);

create unique index menu_item_filters_unique on public.menu_item_filters (menu_item_id, filter);

create table public.menu_item_branch_overrides (
  id             uuid primary key default gen_random_uuid(),
  menu_item_id   uuid not null references public.menu_items(id) on delete cascade,
  branch_id      uuid not null references public.branches(id) on delete cascade,
  price_override numeric(10,2),
  is_available   boolean,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create unique index menu_item_branch_overrides_unique on public.menu_item_branch_overrides (menu_item_id, branch_id);

alter table public.menu_items enable row level security;
alter table public.menu_item_photos enable row level security;
alter table public.menu_item_filters enable row level security;
alter table public.menu_item_branch_overrides enable row level security;

create trigger menu_items_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

-- Trigger: price change history
create table public.price_change_history (
  id            uuid primary key default gen_random_uuid(),
  menu_item_id  uuid not null references public.menu_items(id) on delete cascade,
  old_price     numeric(10,2) not null,
  new_price     numeric(10,2) not null,
  changed_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index price_change_history_item_idx on public.price_change_history (menu_item_id, created_at desc);

alter table public.price_change_history enable row level security;

create or replace function public.record_price_change()
returns trigger language plpgsql as $$
begin
  if old.price <> new.price then
    insert into public.price_change_history (menu_item_id, old_price, new_price, changed_by)
    values (new.id, old.price, new.price, auth.uid());
  end if;
  return new;
end;
$$;

create trigger menu_items_price_change
  after update on public.menu_items
  for each row execute function public.record_price_change();
