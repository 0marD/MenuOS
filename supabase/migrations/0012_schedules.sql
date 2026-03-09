-- Migration: branch_schedules
-- Phase 1F.1.53

create table public.branch_schedules (
  id               uuid primary key default gen_random_uuid(),
  branch_id        uuid not null references public.branches(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  day_of_week      smallint not null check (day_of_week between 0 and 6), -- 0=Sunday … 6=Saturday
  opens_at         time not null,
  closes_at        time not null,
  is_open          boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint branch_schedules_unique unique (branch_id, day_of_week)
);

create index branch_schedules_branch_idx on public.branch_schedules (branch_id);

alter table public.branch_schedules enable row level security;

create trigger branch_schedules_updated_at
  before update on public.branch_schedules
  for each row execute function public.set_updated_at();

-- RLS: staff of same org
create policy "schedules_select_own_org" on public.branch_schedules
  for select using (organization_id = public.get_user_org_id());

create policy "schedules_insert_admin" on public.branch_schedules
  for insert with check (
    organization_id = public.get_user_org_id()
    and public.get_user_role() in ('super_admin', 'manager')
  );

create policy "schedules_update_admin" on public.branch_schedules
  for update using (
    organization_id = public.get_user_org_id()
    and public.get_user_role() in ('super_admin', 'manager')
  );

-- Public read for customer PWA (open/close check)
create policy "schedules_select_public" on public.branch_schedules
  for select using (true);
