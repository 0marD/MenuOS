'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import type { BranchInput } from '@menuos/shared';

export async function createBranch(data: BranchInput) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase.from('branches').insert({
    organization_id: org.id,
    name: data.name,
    address: data.address ?? null,
    phone: data.phone ?? null,
    timezone: data.timezone,
  });

  if (error) return { error: 'Error al crear la sucursal.' };
  revalidatePath('/settings/branches');
}

export async function updateBranch(id: string, data: BranchInput) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('branches')
    .update({
      name: data.name,
      address: data.address ?? null,
      phone: data.phone ?? null,
      timezone: data.timezone,
    })
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al actualizar la sucursal.' };
  revalidatePath('/settings/branches');
}

export async function toggleBranchActive(id: string, isActive: boolean) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('branches')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al cambiar estado de la sucursal.' };
  revalidatePath('/settings/branches');
}

export async function deleteBranch(id: string) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('branches')
    .delete()
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al eliminar la sucursal.' };
  revalidatePath('/settings/branches');
}
