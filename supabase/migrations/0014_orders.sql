CREATE TABLE restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  zone TEXT,
  qr_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  notes TEXT,
  is_ready BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES staff_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER restaurant_tables_updated_at
  BEFORE UPDATE ON restaurant_tables
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_select_tables" ON restaurant_tables
  FOR SELECT USING (organization_id = auth_org_id());

CREATE POLICY "public_select_tables_by_token" ON restaurant_tables
  FOR SELECT USING (is_active = true);

CREATE POLICY "admin_write_tables" ON restaurant_tables
  FOR ALL USING (
    organization_id = auth_org_id()
    AND auth_role() IN ('super_admin', 'manager')
  );

CREATE POLICY "staff_select_orders" ON orders
  FOR SELECT USING (
    branch_id IN (SELECT id FROM branches WHERE organization_id = auth_org_id())
  );

CREATE POLICY "public_insert_order" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "staff_update_order" ON orders
  FOR UPDATE USING (
    branch_id IN (SELECT id FROM branches WHERE organization_id = auth_org_id())
  );

CREATE POLICY "staff_select_order_items" ON order_items
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE organization_id = auth_org_id())
  );

CREATE POLICY "public_insert_order_items" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "staff_update_order_items" ON order_items
  FOR UPDATE USING (
    order_id IN (SELECT id FROM orders WHERE organization_id = auth_org_id())
  );

CREATE POLICY "staff_all_status_history" ON order_status_history
  FOR ALL USING (
    order_id IN (SELECT id FROM orders WHERE organization_id = auth_org_id())
  );

-- Indexes
CREATE INDEX idx_orders_branch_status ON orders(branch_id, status, created_at DESC);
CREATE INDEX idx_orders_org ON orders(organization_id, created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_restaurant_tables_branch ON restaurant_tables(branch_id, is_active);
CREATE INDEX idx_restaurant_tables_qr_token ON restaurant_tables(qr_token);
