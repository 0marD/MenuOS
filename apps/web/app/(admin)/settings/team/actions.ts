'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { staffUserSchema, type StaffUserInput } from '@menuos/shared/validations';
import { generatePin } from '@menuos/shared/utils';
import { hashPin } from '@/lib/auth/hash-pin';
import { requireAuthSession } from '@/lib/auth/get-session';

export async function createStaffMember(
  orgId: string,
  data: StaffUserInput
): Promise<{ success: boolean; error?: string; id?: string; pin?: string }> {
  try {
    const session = await requireAuthSession();
    if (session.orgId !== orgId || !['super_admin', 'manager'].includes(session.role)) {
      return { success: false, error: 'Sin autorización' };
    }
  } catch {
    return { success: false, error: 'Sin autorización' };
  }

  const parsed = staffUserSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Datos inválidos' };

  const supabase = await createClient();
  const needsPin = parsed.data.role === 'waiter' || parsed.data.role === 'kitchen';
  const pin = needsPin ? generatePin() : undefined;

  let pinHash: string | undefined;
  try {
    pinHash = pin ? await hashPin(pin) : undefined;
  } catch {
    return { success: false, error: 'Error de configuración del servidor' };
  }

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

export async function deleteStaffMember(id: string): Promise<{ success: boolean }> {
  try {
    await requireAuthSession();
  } catch {
    return { success: false };
  }
  const supabase = await createClient();
  await supabase
    .from('staff_users')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id);
  revalidatePath('/admin/settings/team');
  return { success: true };
}

export async function toggleStaffActive(id: string, active: boolean): Promise<{ success: boolean }> {
  try {
    await requireAuthSession();
  } catch {
    return { success: false };
  }
  const supabase = await createClient();
  await supabase.from('staff_users').update({ is_active: active }).eq('id', id);
  revalidatePath('/admin/settings/team');
  return { success: true };
}

export async function regeneratePin(id: string): Promise<{ pin?: string; success: boolean }> {
  try {
    await requireAuthSession();
  } catch {
    return { success: false };
  }
  const supabase = await createClient();
  const pin = generatePin();

  let pinHash: string;
  try {
    pinHash = await hashPin(pin);
  } catch {
    return { success: false };
  }

  const { error } = await supabase.from('staff_users').update({ pin_hash: pinHash }).eq('id', id);
  if (error) return { success: false };
  return { success: true, pin };
}
