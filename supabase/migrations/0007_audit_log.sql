-- Migration: audit_log (insert-only)
-- Phase 0.17

create table public.audit_log (
  id            uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  user_id       uuid references auth.users(id) on delete set null,
  action        text not null,
  resource      text not null,
  resource_id   uuid,
  old_value     jsonb,
  new_value     jsonb,
  ip_address    inet,
  created_at    timestamptz not null default now()
);

create index audit_log_org_idx on public.audit_log (organization_id, created_at desc);
create index audit_log_user_idx on public.audit_log (user_id, created_at desc);

alter table public.audit_log enable row level security;

-- Only insert allowed, no update/delete
create policy "audit_log_insert" on public.audit_log
  for insert with check (true);

create policy "audit_log_select_own_org" on public.audit_log
  for select using (
    organization_id in (
      select organization_id from public.staff_users
      where auth_user_id = auth.uid() and is_active = true
    )
  );
