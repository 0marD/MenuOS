-- Push notification subscriptions for staff (waiter, kitchen)
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_user_id UUID NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (endpoint)
);

-- Index for fast lookup by branch + role (e.g. find all kitchen screens in branch X)
CREATE INDEX idx_push_subscriptions_branch_role
  ON push_subscriptions(branch_id, role);

-- RLS: only authenticated staff can manage their own subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage own push subscriptions"
  ON push_subscriptions
  FOR ALL
  TO authenticated
  USING (
    staff_user_id IN (
      SELECT id FROM staff_users WHERE auth_id = auth.uid()
    )
  )
  WITH CHECK (
    staff_user_id IN (
      SELECT id FROM staff_users WHERE auth_id = auth.uid()
    )
  );
