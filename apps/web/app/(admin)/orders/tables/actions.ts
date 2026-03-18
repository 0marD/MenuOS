'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';

function generateToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createTable(branchId: string, name: string, zone?: string) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase.from('restaurant_tables').insert({
    organization_id: org.id,
    branch_id: branchId,
    name,
    zone: zone || null,
    qr_token: generateToken(),
  });

  if (error) return { error: 'Error al crear la mesa.' };
  revalidatePath('/orders/tables');
}

export async function deleteTable(id: string) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('restaurant_tables')
    .delete()
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al eliminar la mesa.' };
  revalidatePath('/orders/tables');
}

export async function toggleTableActive(id: string, isActive: boolean) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('restaurant_tables')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al cambiar estado.' };
  revalidatePath('/orders/tables');
}
