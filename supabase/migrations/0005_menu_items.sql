CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
  photo_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_sold_out_today BOOLEAN NOT NULL DEFAULT false,
  is_special BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  preparation_time_minutes INTEGER CHECK (preparation_time_minutes > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE menu_item_branch_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  price_override NUMERIC(10, 2),
  is_available_override BOOLEAN,
  UNIQUE (menu_item_id, branch_id)
);

CREATE TRIGGER menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_menu_items_org_available
  ON menu_items(organization_id, is_available)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_menu_items_category
  ON menu_items(category_id, sort_order)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_menu_items_name_search
  ON menu_items USING gin(to_tsvector('spanish', name))
  WHERE deleted_at IS NULL;
