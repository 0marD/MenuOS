-- Add payment method tracking to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method text
    CHECK (payment_method IN ('cash', 'card', 'transfer', 'pending'))
    DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

COMMENT ON COLUMN orders.payment_method IS 'Payment method: cash, card, transfer, or pending';
COMMENT ON COLUMN orders.paid_at IS 'Timestamp when payment was recorded';
