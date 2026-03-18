-- org_settings and org_texts were already created in 0001.
-- This migration seeds default settings for new organizations
-- via a trigger.

CREATE OR REPLACE FUNCTION create_default_org_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO org_texts (organization_id, key, value) VALUES
    (NEW.id, 'welcome_message', '¡Bienvenido! Explora nuestro menú.'),
    (NEW.id, 'closed_message', 'Estamos cerrados por el momento. ¡Vuelve pronto!');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION create_default_org_settings();
