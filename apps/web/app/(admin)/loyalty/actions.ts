'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import type { LoyaltyProgramInput } from '@menuos/shared';

export async function createLoyaltyProgram(data: LoyaltyProgramInput) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  // Deactivate existing programs first (one active at a time)
  await supabase
    .from('loyalty_programs')
    .update({ is_active: false })
    .eq('organization_id', org.id);

  const { error } = await supabase.from('loyalty_programs').insert({
    organization_id: org.id,
    name: data.name,
    stamps_required: data.stamps_required,
    reward_description: data.reward_description,
    reward_type: data.reward_type,
    stamps_expiry_days: data.stamps_expiry_days ?? null,
    is_active: true,
  });

  if (error) return { error: 'Error al crear el programa.' };
  revalidatePath('/loyalty');
}

export async function toggleLoyaltyProgram(id: string, isActive: boolean) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('loyalty_programs')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al cambiar estado del programa.' };
  revalidatePath('/loyalty');
}
