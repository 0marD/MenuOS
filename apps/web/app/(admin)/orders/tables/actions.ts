'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireOrgSession, requireAuthSession } from '@/lib/auth/get-session';

interface TableData {
  number: number;
  label: string | null;
  zone: string | null;
  capacity: number;
}

export async function createTable(
  orgId: string,
  branchId: string,
  data: TableData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireOrgSession(orgId);
  } catch {
    return { success: false, error: 'Sin autorización' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('restaurant_tables').insert({
    organization_id: orgId,
    branch_id: branchId,
    number: data.number,
    label: data.label,
    zone: data.zone,
    capacity: data.capacity,
  });

  if (error) {
    const msg = error.code === '23505' ? 'Ya existe una mesa con ese número' : 'No se pudo crear la mesa';
    return { success: false, error: msg };
  }

  revalidatePath('/admin/orders/tables');
  return { success: true };
}

export async function updateTable(
  id: string,
  data: TableData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuthSession();
  } catch {
    return { success: false, error: 'Sin autorización' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('restaurant_tables')
    .update({ number: data.number, label: data.label, zone: data.zone, capacity: data.capacity })
    .eq('id', id);

  if (error) return { success: false, error: 'No se pudo actualizar la mesa' };

  revalidatePath('/admin/orders/tables');
  return { success: true };
}

export async function deleteTable(id: string): Promise<{ success: boolean }> {
  try {
    await requireAuthSession();
  } catch {
    return { success: false };
  }
  const supabase = await createClient();
  await supabase
    .from('restaurant_tables')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id);
  revalidatePath('/admin/orders/tables');
  return { success: true };
}

export async function toggleTableActive(id: string, active: boolean): Promise<{ success: boolean }> {
  try {
    await requireAuthSession();
  } catch {
    return { success: false };
  }
  const supabase = await createClient();
  await supabase.from('restaurant_tables').update({ is_active: active }).eq('id', id);
  revalidatePath('/admin/orders/tables');
  return { success: true };
}
