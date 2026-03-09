-- Migration: menu_categories
-- Phase 0.13

create table public.menu_categories (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  name             text not null,
  icon             text,
  color            text,
  sort_order       integer not null default 0,
  is_visible       boolean not null default true,
  schedule_start   time,
  schedule_end     time,
  deleted_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index menu_categories_org_idx on public.menu_categories (organization_id, sort_order) where deleted_at is null;

alter table public.menu_categories enable row level security;

create trigger menu_categories_updated_at
  before update on public.menu_categories
  for each row execute function public.set_updated_at();
