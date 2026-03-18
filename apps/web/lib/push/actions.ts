'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function savePushSubscription(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const jar = await cookies();
  const staffId = jar.get('menuos_staff_id')?.value;
  const branchId = jar.get('menuos_branch_id')?.value;

  if (!staffId) return { error: 'No autenticado.' };

  const supabase = await createClient();

  const { data: staff } = await supabase
    .from('staff_users')
    .select('id, organization_id, role')
    .eq('id', staffId)
    .single();

  if (!staff) return { error: 'Usuario no encontrado.' };

  // Upsert by endpoint (device may re-subscribe with different keys)
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      staff_user_id: staff.id,
      organization_id: staff.organization_id,
      branch_id: branchId ?? null,
      role: staff.role,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: 'endpoint' },
  );

  if (error) return { error: 'Error al guardar suscripción.' };
  return { ok: true };
}

export async function removePushSubscription(endpoint: string) {
  const supabase = await createClient();
  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
  return { ok: true };
}
