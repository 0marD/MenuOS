-- Migration: users (staff) and user_roles
-- Phase 0.12

create table public.staff_users (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  auth_user_id     uuid references auth.users(id) on delete set null,
  branch_id        uuid references public.branches(id) on delete set null,
  name             text not null,
  email            text,
  role             text not null check (role in ('super_admin','manager','waiter','kitchen')),
  pin_hash         text,
  is_active        boolean not null default true,
  deleted_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index staff_users_org_idx on public.staff_users (organization_id) where deleted_at is null;
create index staff_users_auth_idx on public.staff_users (auth_user_id) where auth_user_id is not null;

alter table public.staff_users enable row level security;

create trigger staff_users_updated_at
  before update on public.staff_users
  for each row execute function public.set_updated_at();
