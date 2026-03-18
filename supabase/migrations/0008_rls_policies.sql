-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_branch_overrides ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's organization_id from staff_users
CREATE OR REPLACE FUNCTION auth_org_id()
RETURNS UUID AS $$
  SELECT organization_id
  FROM staff_users
  WHERE auth_id = auth.uid()
    AND is_active = true
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT AS $$
  SELECT role
  FROM staff_users
  WHERE auth_id = auth.uid()
    AND is_active = true
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE POLICY "staff_select_own_org" ON organizations
  FOR SELECT USING (id = auth_org_id());

CREATE POLICY "super_admin_update_org" ON organizations
  FOR UPDATE USING (
    id = auth_org_id()
    AND auth_role() = 'super_admin'
  );

-- ============================================================
-- BRANCHES
-- ============================================================
CREATE POLICY "staff_select_branches" ON branches
  FOR SELECT USING (organization_id = auth_org_id());

CREATE POLICY "admin_insert_branch" ON branches
  FOR INSERT WITH CHECK (
    organization_id = auth_org_id()
    AND auth_role() IN ('super_admin', 'manager')
  );

CREATE POLICY "admin_update_branch" ON branches
  FOR UPDATE USING (
    organization_id = auth_org_id()
    AND auth_role() IN ('super_admin', 'manager')
  );

CREATE POLICY "super_admin_delete_branch" ON branches
  FOR DELETE USING (
    organization_id = auth_org_id()
    AND auth_role() = 'super_admin'
  );

-- ============================================================
-- STAFF USERS
-- ============================================================
CREATE POLICY "staff_select_own_record" ON staff_users
  FOR SELECT USING (auth_id = auth.uid() OR organization_id = auth_org_id());

CREATE POLICY "admin_insert_staff" ON staff_users
  FOR INSERT WITH CHECK (
    organization_id = auth_org_id()
    AND auth_role() IN ('super_admin', 'manager')
  );

CREATE POLICY "admin_update_staff" ON staff_users
  FOR UPDATE USING (
    organization_id = auth_org_id()
    AND auth_role() IN ('super_admin', 'manager')
  );

CREATE POLICY "super_admin_delete_staff" ON staff_users
  FOR DELETE USING (
    organization_id = auth_org_id()
    AND auth_role() = 'super_admin'
    AND auth_id != auth.uid()
  );

-- ============================================================
-- DESIGN TEMPLATES (public read)
-- ============================================================
CREATE POLICY "public_select_templates" ON design_templates
  FOR SELECT USING (true);

-- ============================================================
-- ORG SETTINGS & TEXTS
-- ============================================================
CREATE POLICY "staff_select_org_settings" ON org_settings
  FOR SELECT USING (organization_id = auth_org_id());

CREATE POLICY "admin_write_org_settings" ON org_settings
  FOR ALL USING (
    organization_id = auth_org_id()
    AND auth_role() IN ('super_admin', 'manager')
  );

CREATE POLICY "public_select_org_texts" ON org_texts
  FOR SELECT USING (true);

CREATE POLICY "admin_write_org_texts" ON org_texts
  FOR ALL USING (
    organization_id = auth_org_id()
    AND auth_role() IN ('super_admin', 'manager')
  );

-- ============================================================
-- AUDIT LOG (insert-only for staff)
-- ============================================================
CREATE POLICY "staff_insert_audit" ON audit_log
  FOR INSERT WITH CHECK (organization_id = auth_org_id());

CREATE POLICY "admin_select_audit" ON audit_log
  FOR SELECT USING (
    organization_id = auth_org_id()
    AND auth_role() IN ('super_admin', 'manager')
  );

-- ============================================================
-- MENU CATEGORIES
-- ============================================================
CREATE POLICY "public_select_categories" ON menu_categories
  FOR SELECT USING (true);

CREATE POLICY "admin_insert_category" ON menu_categories
  FOR INSERT WITH CHECK (
    organization_id = auth_org_id()
    AND auth_role() IN ('super_admin', 'manager')
  );

CREATE POLICY "admin_update_category" ON menu_categories
  FOR UPDATE USING (
    organization_id = auth_org_id()
    AND auth_role() IN ('super_admin', 'manager')
  );

CREATE POLICY "admin_delete_category" ON menu_categories
  FOR DELETE USING (
    organization_id = auth_org_id()
    AND auth_role() IN ('super_admin', 'manager')
  );

-- ============================================================
-- MENU ITEMS
-- ============================================================
CREATE POLICY "public_select_items" ON menu_items
  FOR SELECT USING (true);

CREATE POLICY "admin_insert_item" ON menu_items
  FOR INSERT WITH CHECK (
    organization_id = auth_org_id()
    AND auth_role() IN ('super_admin', 'manager')
  );

CREATE POLICY "admin_update_item" ON menu_items
  FOR UPDATE USING (
    organization_id = auth_org_id()
    AND auth_role() IN ('super_admin', 'manager')
  );

CREATE POLICY "admin_delete_item" ON menu_items
  FOR DELETE USING (
    organization_id = auth_org_id()
    AND auth_role() IN ('super_admin', 'manager')
  );

CREATE POLICY "public_select_overrides" ON menu_item_branch_overrides
  FOR SELECT USING (true);

CREATE POLICY "admin_write_overrides" ON menu_item_branch_overrides
  FOR ALL USING (
    auth_role() IN ('super_admin', 'manager')
  );
