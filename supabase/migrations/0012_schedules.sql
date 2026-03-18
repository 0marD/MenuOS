CREATE TABLE branch_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  opens_at TIME,
  closes_at TIME,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (branch_id, day_of_week)
);

ALTER TABLE branch_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_select_schedules" ON branch_schedules
  FOR SELECT USING (
    branch_id IN (
      SELECT id FROM branches WHERE organization_id = auth_org_id()
    )
  );

CREATE POLICY "admin_write_schedules" ON branch_schedules
  FOR ALL USING (
    branch_id IN (
      SELECT id FROM branches WHERE organization_id = auth_org_id()
    )
    AND auth_role() IN ('super_admin', 'manager')
  );
