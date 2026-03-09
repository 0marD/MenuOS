'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { staffUserSchema, type StaffUserInput } from '@menuos/shared/validations';
import { generatePin } from '@menuos/shared/utils';

const BCRYPT_ROUNDS = 12;

async function hashPin(pin: string): Promise<string> {
  // In production, use bcrypt. Here we use a simple approach compatible with
  // the server environment. Replace with bcrypt when available.
  const encoder = new TextEncoder();
  const salt = process.env['PIN_SALT'] ?? 'menuos-pin-salt';
  const data = encoder.encode(pin + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createStaffMember(
  orgId: string,
  data: StaffUserInput
): Promise<{ success: boolean; error?: string; id?: string; pin?: string }> {
  const parsed = staffUserSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Datos inválidos' };

  const supabase = await createClient();
  const needsPin = parsed.data.role === 'waiter' || parsed.data.role === 'kitchen';
  const pin = needsPin ? generatePin() : undefined;
  const pinHash = pin ? await hashPin(pin) : undefined;

  const { data: member, error } = await supabase
    .from('staff_users')
    .insert({
      organization_id: orgId,
      name: parsed.data.name,
      email: parsed.data.email ?? null,
      role: parsed.data.role,
      branch_id: parsed.data.branch_id ?? null,
      pin_hash: pinHash ?? null,
    })
    .select('id')
    .single();

  if (error) return { success: false, error: 'No se pudo crear el miembro' };

  revalidatePath('/admin/settings/team');
  if (pin) return { success: true, id: member.id, pin };
  return { success: true, id: member.id };
}

export async function deleteStaffMember(
  id: string
): Promise<{ success: boolean }> {
  const supabase = await createClient();
  await supabase
    .from('staff_users')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id);
  revalidatePath('/admin/settings/team');
  return { success: true };
}

export async function toggleStaffActive(
  id: string,
  active: boolean
): Promise<{ success: boolean }> {
  const supabase = await createClient();
  await supabase
    .from('staff_users')
    .update({ is_active: active })
    .eq('id', id);
  revalidatePath('/admin/settings/team');
  return { success: true };
}

export async function regeneratePin(
  id: string
): Promise<{ pin?: string; success: boolean }> {
  const supabase = await createClient();
  const pin = generatePin();
  const pinHash = await hashPin(pin);

  const { error } = await supabase
    .from('staff_users')
    .update({ pin_hash: pinHash })
    .eq('id', id);

  if (error) return { success: false };
  return { success: true, pin };
}
