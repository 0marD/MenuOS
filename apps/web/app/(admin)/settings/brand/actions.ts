'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import type { BrandSettingsInput } from '@menuos/shared';

export async function updateBrandSettings(data: BrandSettingsInput) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('organizations')
    .update({
      name: data.name,
      logo_url: data.logo_url || null,
      banner_url: data.banner_url || null,
      primary_color: data.primary_color || null,
      secondary_color: data.secondary_color || null,
    })
    .eq('id', org.id);

  if (error) return { error: 'Error al guardar la configuración de marca.' };

  revalidatePath('/settings/brand');
  revalidatePath(`/${org.slug}`);
}
