CREATE TABLE loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stamps_required INTEGER NOT NULL DEFAULT 10
    CHECK (stamps_required BETWEEN 3 AND 20),
  reward_description TEXT NOT NULL,
  reward_type TEXT NOT NULL DEFAULT 'free_item'
    CHECK (reward_type IN ('discount', 'free_item', 'bogo')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  stamps_expiry_days INTEGER CHECK (stamps_expiry_days > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stamp_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stamps_count INTEGER NOT NULL DEFAULT 0,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (program_id, customer_id)
);

CREATE TABLE stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stamp_card_id UUID NOT NULL REFERENCES stamp_cards(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  table_id UUID,
  granted_by UUID REFERENCES staff_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stamp_card_id UUID NOT NULL REFERENCES stamp_cards(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  is_redeemed BOOLEAN NOT NULL DEFAULT false,
  redeemed_at TIMESTAMPTZ,
  redeemed_by UUID REFERENCES staff_users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER loyalty_programs_updated_at
  BEFORE UPDATE ON loyalty_programs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER stamp_cards_updated_at
  BEFORE UPDATE ON stamp_cards
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamp_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_select_loyalty_programs" ON loyalty_programs
  FOR SELECT USING (organization_id = auth_org_id() OR true); -- public can read active programs

CREATE POLICY "admin_write_loyalty_programs" ON loyalty_programs
  FOR ALL USING (
    organization_id = auth_org_id()
    AND auth_role() IN ('super_admin', 'manager')
  );

CREATE POLICY "staff_select_stamp_cards" ON stamp_cards
  FOR SELECT USING (organization_id = auth_org_id());

CREATE POLICY "public_insert_stamp_card" ON stamp_cards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_update_stamp_card" ON stamp_cards
  FOR UPDATE USING (true);

CREATE POLICY "staff_insert_stamp" ON stamps
  FOR INSERT WITH CHECK (
    organization_id = auth_org_id()
    AND auth_role() IN ('super_admin', 'manager', 'waiter')
  );

CREATE POLICY "staff_select_stamps" ON stamps
  FOR SELECT USING (organization_id = auth_org_id());

CREATE POLICY "staff_select_rewards" ON rewards
  FOR SELECT USING (organization_id = auth_org_id());

CREATE POLICY "service_insert_reward" ON rewards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "staff_update_reward" ON rewards
  FOR UPDATE USING (organization_id = auth_org_id());

CREATE INDEX idx_loyalty_programs_org ON loyalty_programs(organization_id, is_active);
CREATE INDEX idx_stamp_cards_customer ON stamp_cards(customer_id, organization_id);
CREATE INDEX idx_stamps_card ON stamps(stamp_card_id, created_at DESC);
CREATE INDEX idx_rewards_code ON rewards(code);
