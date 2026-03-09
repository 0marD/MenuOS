-- Migration: branches
-- Phase 0.11

create table public.branches (
  id                      uuid primary key default gen_random_uuid(),
  organization_id         uuid not null references public.organizations(id) on delete cascade,
  name                    text not null,
  address                 text,
  timezone                text not null default 'America/Mexico_City',
  is_active               boolean not null default true,
  is_temporarily_closed   boolean not null default false,
  closed_message          text,
  deleted_at              timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index branches_org_idx on public.branches (organization_id) where deleted_at is null;

alter table public.branches enable row level security;

create trigger branches_updated_at
  before update on public.branches
  for each row execute function public.set_updated_at();
