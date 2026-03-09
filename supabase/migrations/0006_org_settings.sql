-- Migration: design_templates, org_settings, org_texts
-- Phase 0.16

create table public.design_templates (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  preview_url  text,
  config       jsonb not null default '{}'
);

insert into public.design_templates (name, slug, config) values
  ('Clásico', 'classic', '{"layout":"grid","cardStyle":"rounded","headerStyle":"logo-top"}'),
  ('Moderno', 'modern', '{"layout":"list","cardStyle":"sharp","headerStyle":"hero-banner"}'),
  ('Rústico', 'rustic', '{"layout":"grid","cardStyle":"soft","headerStyle":"centered-logo"}'),
  ('Elegante', 'elegant', '{"layout":"masonry","cardStyle":"bordered","headerStyle":"minimal"}'),
  ('Minimalista', 'minimal', '{"layout":"list","cardStyle":"ghost","headerStyle":"inline-logo"}');

create table public.org_settings (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  key              text not null,
  value            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index org_settings_key_idx on public.org_settings (organization_id, key);

alter table public.org_settings enable row level security;

create trigger org_settings_updated_at
  before update on public.org_settings
  for each row execute function public.set_updated_at();

create table public.org_texts (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  key              text not null,
  value            text not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index org_texts_key_idx on public.org_texts (organization_id, key);

alter table public.org_texts enable row level security;

create trigger org_texts_updated_at
  before update on public.org_texts
  for each row execute function public.set_updated_at();
