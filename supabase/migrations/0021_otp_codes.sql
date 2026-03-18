-- OTP codes for WhatsApp phone verification
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_hash TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  attempts INT NOT NULL DEFAULT 0,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_otp_codes_lookup
  ON otp_codes(organization_id, phone_hash, expires_at)
  WHERE verified_at IS NULL;

-- Auto-purge expired codes (requires pg_cron or manual cleanup)
-- Codes older than 1 hour can be deleted
CREATE INDEX idx_otp_codes_cleanup ON otp_codes(created_at);

-- No RLS needed — accessed only via server actions (service role not needed,
-- but anon/auth users should not read/write directly)
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Only service role can manage OTP codes (server actions use service key via Edge Functions)
-- Regular authenticated and anon users have no direct access
CREATE POLICY "otp_codes_no_direct_access" ON otp_codes
  FOR ALL TO anon, authenticated USING (false);
