-- Add dietary filter flags to menu_items
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS is_vegetarian BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_gluten_free BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_spicy BOOLEAN NOT NULL DEFAULT false;

-- Index to support dietary filter queries on the public menu
CREATE INDEX IF NOT EXISTS idx_menu_items_dietary
  ON menu_items(organization_id, is_vegetarian, is_gluten_free, is_spicy)
  WHERE deleted_at IS NULL;
