'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { loyaltyProgramSchema, type LoyaltyProgramInput } from '@menuos/shared/validations';
import { requireOrgSession, requireAuthSession } from '@/lib/auth/get-session';

export async function createLoyaltyProgram(
  orgId: string,
  data: LoyaltyProgramInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireOrgSession(orgId);
    if (!['super_admin', 'manager'].includes(session.role)) {
      return { success: false, error: 'Sin autorización' };
    }
  } catch {
    return { success: false, error: 'Sin autorización' };
  }

  const parsed = loyaltyProgramSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Datos inválidos' };

  const supabase = await createClient();
  const { error } = await supabase.from('loyalty_programs').insert({
    organization_id: orgId,
    name: parsed.data.name,
    stamps_required: parsed.data.stamps_required,
    reward_type: parsed.data.reward_type,
    reward_value: parsed.data.reward_value,
    expiration_days: parsed.data.expiration_days ?? null,
  });

  if (error) return { success: false, error: 'No se pudo crear el programa' };

  revalidatePath('/admin/loyalty');
  return { success: true };
}

export async function toggleLoyaltyProgram(
  id: string,
  active: boolean
): Promise<{ success: boolean }> {
  try {
    await requireAuthSession();
  } catch {
    return { success: false };
  }
  const supabase = await createClient();
  await supabase.from('loyalty_programs').update({ is_active: active }).eq('id', id);
  revalidatePath('/admin/loyalty');
  return { success: true };
}
