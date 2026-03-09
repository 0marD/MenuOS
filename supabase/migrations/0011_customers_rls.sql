-- Migration: RLS policies for customers, customer_visits, customer_consents
-- Phase 1D — policies were missing from 0009

-- CUSTOMERS: staff of same org can read/insert/update; no delete (soft delete only)
create policy "customers_select_own_org" on public.customers
  for select using (organization_id = public.get_user_org_id());

create policy "customers_insert_own_org" on public.customers
  for insert with check (organization_id = public.get_user_org_id());

create policy "customers_update_own_org" on public.customers
  for update using (
    organization_id = public.get_user_org_id()
    and public.get_user_role() in ('super_admin', 'manager')
  );

-- Allow anon inserts (customer self-registration from public PWA)
create policy "customers_insert_anon" on public.customers
  for insert with check (true);

-- CUSTOMER_VISITS
create policy "customer_visits_select_own_org" on public.customer_visits
  for select using (organization_id = public.get_user_org_id());

create policy "customer_visits_insert_staff" on public.customer_visits
  for insert with check (organization_id = public.get_user_org_id());

-- CUSTOMER_CONSENTS
create policy "customer_consents_select_own_org" on public.customer_consents
  for select using (
    customer_id in (
      select id from public.customers
      where organization_id = public.get_user_org_id()
    )
  );

create policy "customer_consents_insert_anon" on public.customer_consents
  for insert with check (true);
