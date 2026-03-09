'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { campaignSchema, type CampaignInput } from '@menuos/shared/validations';

export async function createCampaign(
  orgId: string,
  data: CampaignInput
): Promise<{ success: boolean; error?: string; id?: string }> {
  const parsed = campaignSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Datos inválidos' };

  const supabase = await createClient();

  const status = parsed.data.scheduled_at ? 'scheduled' : 'draft';

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .insert({
      organization_id: orgId,
      name: parsed.data.name,
      segment: parsed.data.segment ?? null,
      status,
      scheduled_at: parsed.data.scheduled_at ?? null,
    })
    .select('id')
    .single();

  if (error) return { success: false, error: 'No se pudo crear la campaña' };

  revalidatePath('/admin/campaigns');
  return { success: true, id: campaign.id };
}

export async function deleteCampaign(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('campaigns')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/campaigns');
  return { success: true };
}
