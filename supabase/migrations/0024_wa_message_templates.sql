-- WhatsApp message templates stored in DB (admin-editable)
CREATE TABLE IF NOT EXISTS wa_message_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  -- NULL organization_id = system default template
  template_key text NOT NULL,  -- 'reactivation_offer' | 'birthday_greeting' | 'stamp_expiration_warning'
  display_name text NOT NULL,
  message_body text NOT NULL,
  variables    text[] NOT NULL DEFAULT '{}',  -- e.g. ['{{nombre}}', '{{dias}}']
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, template_key)
);

-- System default templates (org-agnostic)
INSERT INTO wa_message_templates (organization_id, template_key, display_name, message_body, variables)
VALUES
  (NULL, 'reactivation_offer',      'Reactivación de clientes dormidos',
   '¡Hola {{nombre}}! 👋 Te extrañamos en {{restaurante}}. Ven esta semana y obtén un descuento especial solo por regresar. ¡Te esperamos!',
   ARRAY['{{nombre}}', '{{restaurante}}']),
  (NULL, 'birthday_greeting',       'Felicitación de cumpleaños',
   '🎂 ¡Feliz cumpleaños {{nombre}}! En {{restaurante}} queremos celebrar contigo. Ven hoy y disfruta un regalo especial de nuestra parte. ¡Salud!',
   ARRAY['{{nombre}}', '{{restaurante}}']),
  (NULL, 'stamp_expiration_warning', 'Aviso de expiración de tarjeta',
   '⏰ {{nombre}}, tu tarjeta de sellos en {{restaurante}} vence mañana. ¡Tienes {{sellos}} sellos! Ven antes de que expire y canjea tu recompensa.',
   ARRAY['{{nombre}}', '{{restaurante}}', '{{sellos}}'])
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE wa_message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_manage_templates"
  ON wa_message_templates
  FOR ALL
  TO authenticated
  USING (
    organization_id IS NULL
    OR organization_id IN (
      SELECT organization_id FROM staff_users
      WHERE id = auth.uid() AND role IN ('super_admin', 'manager')
    )
  );
