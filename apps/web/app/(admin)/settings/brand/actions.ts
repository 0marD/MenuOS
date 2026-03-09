'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { orgBrandSchema, type OrgBrandInput } from '@menuos/shared/validations';

export async function updateBrandSettings(
  orgId: string,
  data: OrgBrandInput & { template_slug?: string }
): Promise<{ success: boolean; error?: string }> {
  const parsed = orgBrandSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Datos inválidos' };

  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (parsed.data.logo_url !== undefined) updates['logo_url'] = parsed.data.logo_url;
  if (parsed.data.banner_url !== undefined) updates['banner_url'] = parsed.data.banner_url;
  if (parsed.data.colors !== undefined) updates['colors'] = parsed.data.colors;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', orgId);
    if (error) return { success: false, error: error.message };
  }

  if (data.template_slug) {
    await supabase
      .from('org_settings')
      .upsert({
        organization_id: orgId,
        key: 'design_template',
        value: data.template_slug,
      }, { onConflict: 'organization_id,key' });
  }

  revalidatePath('/admin/settings/brand');
  return { success: true };
}
