-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE stamp_cards;

-- Prevent direct deletion of audit_log rows
CREATE RULE no_delete_audit_log AS
  ON DELETE TO audit_log DO INSTEAD NOTHING;

CREATE RULE no_update_audit_log AS
  ON UPDATE TO audit_log DO INSTEAD NOTHING;

-- Function to check plan limits before inserting branches
CREATE OR REPLACE FUNCTION check_branch_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  org_plan TEXT;
  max_branches INTEGER;
BEGIN
  SELECT plan INTO org_plan
  FROM organizations WHERE id = NEW.organization_id;

  SELECT COUNT(*) INTO current_count
  FROM branches
  WHERE organization_id = NEW.organization_id AND is_active = true;

  max_branches := CASE org_plan
    WHEN 'starter' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'business' THEN 5
    ELSE 1
  END;

  IF current_count >= max_branches THEN
    RAISE EXCEPTION 'Plan limit reached: % branches allowed for plan %', max_branches, org_plan;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_branch_limit
  BEFORE INSERT ON branches
  FOR EACH ROW EXECUTE FUNCTION check_branch_limit();
