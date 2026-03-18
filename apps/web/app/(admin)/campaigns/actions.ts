'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import type { CampaignInput } from '@menuos/shared';

export async function createCampaign(data: CampaignInput) {
  const { org, staffUser } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase.from('campaigns').insert({
    organization_id: org.id,
    name: data.name,
    template_name: data.template_name,
    message_body: data.message_body ?? null,
    segment: data.segment,
    status: 'draft',
    scheduled_at: data.scheduled_at ?? null,
    created_by: staffUser.id,
  });

  if (error) return { error: 'Error al crear la campaña.' };
  revalidatePath('/campaigns');
}

export async function sendCampaign(id: string) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase.functions.invoke('send-whatsapp', {
    body: { campaign_id: id, organization_id: org.id },
  });

  if (error) return { error: 'Error al enviar la campaña. Verifica tu API key de WhatsApp.' };

  revalidatePath('/campaigns');
}

export async function deleteCampaign(id: string) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al eliminar la campaña.' };
  revalidatePath('/campaigns');
}
