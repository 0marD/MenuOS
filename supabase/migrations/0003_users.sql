CREATE TABLE staff_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_ids UUID[] NOT NULL DEFAULT '{}',
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL
    CHECK (role IN ('super_admin', 'manager', 'waiter', 'kitchen')),
  pin_hash TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER staff_users_updated_at
  BEFORE UPDATE ON staff_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_staff_users_auth_id ON staff_users(auth_id);
CREATE INDEX idx_staff_users_org ON staff_users(organization_id, is_active);
