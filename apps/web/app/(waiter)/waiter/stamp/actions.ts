'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

async function requireWaiterSession() {
  const jar = await cookies();
  const staffId = jar.get('menuos_staff_id')?.value;
  const branchId = jar.get('menuos_branch_id')?.value;
  if (!staffId || !branchId) throw new Error('Unauthorized');
  return { staffId, branchId };
}

export async function findCustomerByPhone(phone: string, orgId: string) {
  const supabase = await createClient();
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(phone));
  const hash = Buffer.from(hashBuffer).toString('hex');

  const { data } = await supabase
    .from('customers')
    .select('id, name, visit_count, segment')
    .eq('organization_id', orgId)
    .eq('phone_hash', hash)
    .single();

  if (!data) return { error: 'Cliente no encontrado.' };
  return { customer: data };
}

export async function grantStamp(
  customerId: string,
  programId: string,
  orgId: string,
  tableId?: string | null,
) {
  const { staffId, branchId } = await requireWaiterSession();
  const supabase = await createClient();

  // Delegate to Edge Function for anti-fraud validation + business logic
  const { data, error } = await supabase.functions.invoke('grant-stamp', {
    body: {
      customer_id: customerId,
      program_id: programId,
      organization_id: orgId,
      branch_id: branchId,
      table_id: tableId ?? null,
      granted_by: staffId,
    },
  });

  if (error) return { error: 'Error al comunicarse con el servidor.' };
  if (data?.error) return { error: data.error };

  return {
    stampsCount: data.stampsCount as number,
    isComplete: data.isComplete as boolean,
    reward: data.reward as string | undefined,
    rewardCode: data.rewardCode as string | undefined,
  };
}

export async function redeemReward(code: string, orgId: string) {
  const { staffId } = await requireWaiterSession();
  const supabase = await createClient();

  const { data: reward } = await supabase
    .from('rewards')
    .select('id, is_redeemed')
    .eq('code', code.toUpperCase())
    .eq('organization_id', orgId)
    .single();

  if (!reward) return { error: 'Código inválido.' };
  if (reward.is_redeemed) return { error: 'Este código ya fue canjeado.' };

  await supabase
    .from('rewards')
    .update({ is_redeemed: true, redeemed_at: new Date().toISOString(), redeemed_by: staffId })
    .eq('id', reward.id);

  return { success: true };
}
