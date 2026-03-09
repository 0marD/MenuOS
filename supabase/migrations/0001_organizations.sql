-- Migration: organizations
-- Phase 0.10

create extension if not exists "pgcrypto";

create table public.organizations (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  slug                 text not null unique,
  logo_url             text,
  banner_url           text,
  colors               jsonb,
  plan                 text not null default 'starter' check (plan in ('starter','pro','business')),
  subscription_status  text not null default 'trialing' check (subscription_status in ('active','trialing','past_due','cancelled')),
  stripe_customer_id   text,
  trial_ends_at        timestamptz default (now() + interval '14 days'),
  deleted_at           timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create unique index organizations_slug_idx on public.organizations (slug) where deleted_at is null;

alter table public.organizations enable row level security;

-- Trigger: updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();
