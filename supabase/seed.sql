-- Seed: design templates
INSERT INTO design_templates (id, name, config) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Clásico', '{"theme": "classic"}'),
  ('00000000-0000-0000-0000-000000000002', 'Moderno', '{"theme": "modern"}'),
  ('00000000-0000-0000-0000-000000000003', 'Rústico', '{"theme": "rustic"}'),
  ('00000000-0000-0000-0000-000000000004', 'Minimalista', '{"theme": "minimal"}'),
  ('00000000-0000-0000-0000-000000000005', 'Vibrante', '{"theme": "vibrant"}')
ON CONFLICT DO NOTHING;
