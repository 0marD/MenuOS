-- Migration: RLS Policies for all tables
-- Phase 0.18

-- Helper function: get user's organization_id
create or replace function public.get_user_org_id()
returns uuid language sql stable security definer as $$
  select organization_id from public.staff_users
  where auth_user_id = auth.uid() and is_active = true
  limit 1;
$$;

-- Helper function: get user's role
create or replace function public.get_user_role()
returns text language sql stable security definer as $$
  select role from public.staff_users
  where auth_user_id = auth.uid() and is_active = true
  limit 1;
$$;

-- ORGANIZATIONS
create policy "org_select_own" on public.organizations
  for select using (id = public.get_user_org_id());

create policy "org_update_admin" on public.organizations
  for update using (
    id = public.get_user_org_id()
    and public.get_user_role() in ('super_admin','manager')
  );

-- BRANCHES
create policy "branches_select_own_org" on public.branches
  for select using (organization_id = public.get_user_org_id());

create policy "branches_insert_admin" on public.branches
  for insert with check (
    organization_id = public.get_user_org_id()
    and public.get_user_role() in ('super_admin','manager')
  );

create policy "branches_update_admin" on public.branches
  for update using (
    organization_id = public.get_user_org_id()
    and public.get_user_role() in ('super_admin','manager')
  );

-- STAFF USERS
create policy "staff_select_own_org" on public.staff_users
  for select using (organization_id = public.get_user_org_id());

create policy "staff_insert_admin" on public.staff_users
  for insert with check (
    organization_id = public.get_user_org_id()
    and public.get_user_role() in ('super_admin','manager')
  );

create policy "staff_update_admin" on public.staff_users
  for update using (
    organization_id = public.get_user_org_id()
    and public.get_user_role() in ('super_admin','manager')
  );

-- MENU CATEGORIES
create policy "menu_categories_select_own_org" on public.menu_categories
  for select using (organization_id = public.get_user_org_id());

create policy "menu_categories_select_public" on public.menu_categories
  for select using (is_visible = true and deleted_at is null);

create policy "menu_categories_write_admin" on public.menu_categories
  for all using (
    organization_id = public.get_user_org_id()
    and public.get_user_role() in ('super_admin','manager')
  );

-- MENU ITEMS
create policy "menu_items_select_own_org" on public.menu_items
  for select using (organization_id = public.get_user_org_id());

create policy "menu_items_select_public" on public.menu_items
  for select using (is_available = true and deleted_at is null);

create policy "menu_items_write_admin" on public.menu_items
  for all using (
    organization_id = public.get_user_org_id()
    and public.get_user_role() in ('super_admin','manager')
  );

-- MENU ITEM PHOTOS (same org as item)
create policy "menu_item_photos_select" on public.menu_item_photos
  for select using (
    menu_item_id in (
      select id from public.menu_items where deleted_at is null
    )
  );

create policy "menu_item_photos_write_admin" on public.menu_item_photos
  for all using (
    menu_item_id in (
      select id from public.menu_items
      where organization_id = public.get_user_org_id()
    )
    and public.get_user_role() in ('super_admin','manager')
  );

-- MENU ITEM FILTERS (same as photos)
create policy "menu_item_filters_select" on public.menu_item_filters
  for select using (
    menu_item_id in (
      select id from public.menu_items where deleted_at is null
    )
  );

create policy "menu_item_filters_write_admin" on public.menu_item_filters
  for all using (
    menu_item_id in (
      select id from public.menu_items
      where organization_id = public.get_user_org_id()
    )
    and public.get_user_role() in ('super_admin','manager')
  );

-- MENU ITEM BRANCH OVERRIDES
create policy "overrides_select_own_org" on public.menu_item_branch_overrides
  for select using (
    menu_item_id in (
      select id from public.menu_items
      where organization_id = public.get_user_org_id()
    )
  );

create policy "overrides_write_admin" on public.menu_item_branch_overrides
  for all using (
    menu_item_id in (
      select id from public.menu_items
      where organization_id = public.get_user_org_id()
    )
    and public.get_user_role() in ('super_admin','manager')
  );

-- PRICE CHANGE HISTORY
create policy "price_history_select_admin" on public.price_change_history
  for select using (
    menu_item_id in (
      select id from public.menu_items
      where organization_id = public.get_user_org_id()
    )
    and public.get_user_role() in ('super_admin','manager')
  );

-- ORG SETTINGS
create policy "org_settings_own_org" on public.org_settings
  for all using (organization_id = public.get_user_org_id());

-- ORG TEXTS
create policy "org_texts_own_org" on public.org_texts
  for all using (organization_id = public.get_user_org_id());
