'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';

export async function saveTemplate(templateKey: string, messageBody: string) {
  const { org } = await requireAdminSession();
  if (!messageBody.trim()) return { error: 'El mensaje no puede estar vacío.' };

  const supabase = await createClient();

  // Fetch the system template to get display_name and variables
  const { data: sys } = await supabase
    .from('wa_message_templates')
    .select('display_name, variables')
    .is('organization_id', null)
    .eq('template_key', templateKey)
    .single();

  if (!sys) return { error: 'Plantilla base no encontrada.' };

  const { error } = await supabase
    .from('wa_message_templates')
    .upsert(
      {
        organization_id: org.id,
        template_key: templateKey,
        display_name: sys.display_name,
        message_body: messageBody.trim(),
        variables: sys.variables,
      },
      { onConflict: 'organization_id,template_key' },
    );

  if (error) return { error: 'Error al guardar la plantilla.' };

  revalidatePath('/settings/templates');
}

export async function resetTemplate(templateKey: string) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  await supabase
    .from('wa_message_templates')
    .delete()
    .eq('organization_id', org.id)
    .eq('template_key', templateKey);

  revalidatePath('/settings/templates');
}
