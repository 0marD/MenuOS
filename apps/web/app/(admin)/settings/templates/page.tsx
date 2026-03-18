import type { Metadata } from 'next';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import { TemplatesForm } from './TemplatesForm';

export const metadata: Metadata = { title: 'Plantillas WhatsApp' };

export default async function TemplatesPage() {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  // Fetch org-specific templates, falling back to system defaults
  const { data: systemTemplates } = await supabase
    .from('wa_message_templates')
    .select('*')
    .is('organization_id', null)
    .order('template_key');

  const { data: orgTemplates } = await supabase
    .from('wa_message_templates')
    .select('*')
    .eq('organization_id', org.id)
    .order('template_key');

  // Merge: org templates override system defaults
  const templates = (systemTemplates ?? []).map((sys) => {
    const override = orgTemplates?.find((o) => o.template_key === sys.template_key);
    return override ?? sys;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Plantillas de WhatsApp</h1>
        <p className="mt-1 text-sm text-muted">
          Personaliza los mensajes automáticos que se envían a tus clientes.
          Usa {'{{nombre}}'}, {'{{restaurante}}'}, etc. como variables dinámicas.
        </p>
      </div>
      <TemplatesForm templates={templates} orgId={org.id} />
    </div>
  );
}
