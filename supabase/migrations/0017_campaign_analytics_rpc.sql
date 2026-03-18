-- RPC to atomically increment campaign_analytics counters
-- Called by the webhook-whatsapp Edge Function to avoid race conditions
-- when multiple delivery/read receipts arrive simultaneously.

CREATE OR REPLACE FUNCTION increment_campaign_analytics(
  p_campaign_id UUID,
  p_delivered   INTEGER DEFAULT 0,
  p_read        INTEGER DEFAULT 0,
  p_failed      INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO campaign_analytics (campaign_id, total_delivered, total_read, total_failed, updated_at)
  VALUES (p_campaign_id, p_delivered, p_read, p_failed, now())
  ON CONFLICT (campaign_id) DO UPDATE
    SET total_delivered = campaign_analytics.total_delivered + EXCLUDED.total_delivered,
        total_read      = campaign_analytics.total_read      + EXCLUDED.total_read,
        total_failed    = campaign_analytics.total_failed    + EXCLUDED.total_failed,
        updated_at      = now();
END;
$$;
