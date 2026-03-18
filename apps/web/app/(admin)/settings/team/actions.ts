'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import { generatePin } from '@menuos/shared';
import { hashPin } from '@/lib/auth/hash-pin';
import type { StaffMemberInput } from '@menuos/shared';

export async function createStaffMember(data: StaffMemberInput) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const pin = generatePin();
  const pinHash = await hashPin(pin);

  const { data: member, error } = await supabase
    .from('staff_users')
    .insert({
      organization_id: org.id,
      name: data.name,
      email: data.email || null,
      role: data.role,
      branch_ids: data.branch_ids,
      pin_hash: pinHash,
    })
    .select('id')
    .single();

  if (error || !member) return { error: 'Error al crear el miembro.' };

  revalidatePath('/settings/team');
  return { pin };
}

export async function updateStaffMember(id: string, data: Partial<StaffMemberInput>) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('staff_users')
    .update({
      ...(data.name !== undefined ? { name: data.name } : {}),
      email: data.email || null,
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.branch_ids !== undefined ? { branch_ids: data.branch_ids } : {}),
    })
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al actualizar el miembro.' };
  revalidatePath('/settings/team');
}

export async function toggleStaffActive(id: string, isActive: boolean) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('staff_users')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al cambiar estado.' };
  revalidatePath('/settings/team');
}

export async function deleteStaffMember(id: string) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('staff_users')
    .delete()
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al eliminar el miembro.' };
  revalidatePath('/settings/team');
}

export async function regeneratePin(id: string) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const pin = generatePin();
  const pinHash = await hashPin(pin);

  const { error } = await supabase
    .from('staff_users')
    .update({ pin_hash: pinHash })
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al regenerar PIN.' };
  revalidatePath('/settings/team');
  return { pin };
}
