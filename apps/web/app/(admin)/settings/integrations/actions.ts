'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';

export async function saveIntegrationKey(key: string, value: string) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase.from('org_settings').upsert(
    {
      organization_id: org.id,
      key,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'organization_id,key' },
  );

  if (error) return { error: 'Error al guardar la configuración.' };
  revalidatePath('/settings/integrations');
}

export async function getIntegrationKeys() {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { data } = await supabase
    .from('org_settings')
    .select('key, value')
    .eq('organization_id', org.id)
    .in('key', ['wa_api_key', 'wa_phone_number_id', 'wa_webhook_secret']);

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    if (typeof row.value === 'string') map[row.key] = row.value;
  }
  return map;
}
