-- Seed: sample restaurant + menu + users
-- Phase 0.20 — FOR DEVELOPMENT ONLY

-- Sample organization
insert into public.organizations (id, name, slug, plan, subscription_status)
values (
  '00000000-0000-0000-0000-000000000001',
  'La Cantina Demo',
  'la-cantina-demo',
  'pro',
  'active'
);

-- Sample branch
insert into public.branches (id, organization_id, name, address, timezone)
values (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Sucursal Centro',
  'Av. Juárez 123, Centro, Guadalajara, Jalisco',
  'America/Mexico_City'
);

-- Sample menu categories
insert into public.menu_categories (id, organization_id, name, icon, sort_order) values
  ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Entradas', '🥗', 0),
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Tacos', '🌮', 1),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Bebidas', '🥤', 2),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Postres', '🍮', 3);

-- Sample menu items
insert into public.menu_items (category_id, organization_id, name, description, price, sort_order) values
  ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Guacamole con totopos', 'Aguacate fresco, jitomate, cebolla y cilantro', 89.00, 0),
  ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Sopa de lima', 'Caldo de pollo con tiras de tortilla', 75.00, 1),
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Taco al pastor', 'Carne de cerdo adobada con piña y cebolla', 35.00, 0),
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Taco de birria', 'Barbacoa de res con consomé', 45.00, 1),
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Taco de suadero', 'Carne de res frita con cebolla y cilantro', 38.00, 2),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Agua de jamaica', 'Flor de jamaica con azúcar al gusto', 35.00, 0),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Michelada', 'Cerveza con limón, sal y chamoy', 75.00, 1),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Flan napolitano', 'Flan casero con cajeta', 65.00, 0);
