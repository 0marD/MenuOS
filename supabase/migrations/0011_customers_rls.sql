ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Customers: public can register (insert), staff can read/update
CREATE POLICY "public_insert_customer" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "staff_select_customers" ON customers
  FOR SELECT USING (organization_id = auth_org_id());

CREATE POLICY "staff_update_customer" ON customers
  FOR UPDATE USING (organization_id = auth_org_id());

-- Customer visits: public can create, staff can read
CREATE POLICY "public_insert_visit" ON customer_visits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "staff_select_visits" ON customer_visits
  FOR SELECT USING (organization_id = auth_org_id());

-- Customer consents
CREATE POLICY "public_insert_consent" ON customer_consents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "staff_select_consents" ON customer_consents
  FOR SELECT USING (organization_id = auth_org_id());

-- Campaigns
CREATE POLICY "admin_all_campaigns" ON campaigns
  FOR ALL USING (
    organization_id = auth_org_id()
    AND auth_role() IN ('super_admin', 'manager')
  );

CREATE POLICY "admin_select_analytics" ON campaign_analytics
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE organization_id = auth_org_id()
    )
  );

CREATE POLICY "service_update_analytics" ON campaign_analytics
  FOR UPDATE USING (true);
