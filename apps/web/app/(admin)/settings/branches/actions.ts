'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { branchSchema, type BranchInput } from '@menuos/shared/validations';

export async function createBranch(
  orgId: string,
  data: BranchInput
): Promise<{ success: boolean; error?: string }> {
  const parsed = branchSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Datos inválidos' };

  const supabase = await createClient();

  const { error } = await supabase.from('branches').insert({
    organization_id: orgId,
    name: parsed.data.name,
    address: parsed.data.address ?? null,
    timezone: parsed.data.timezone,
    is_active: parsed.data.is_active,
  });

  if (error) return { success: false, error: 'No se pudo crear la sucursal' };

  revalidatePath('/admin/settings/branches');
  return { success: true };
}

export async function updateBranch(
  id: string,
  data: BranchInput
): Promise<{ success: boolean; error?: string }> {
  const parsed = branchSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Datos inválidos' };

  const supabase = await createClient();

  const { error } = await supabase
    .from('branches')
    .update({
      name: parsed.data.name,
      address: parsed.data.address ?? null,
      timezone: parsed.data.timezone,
      is_active: parsed.data.is_active,
    })
    .eq('id', id);

  if (error) return { success: false, error: 'No se pudo actualizar la sucursal' };

  revalidatePath('/admin/settings/branches');
  return { success: true };
}

export async function deleteBranch(
  id: string
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  await supabase
    .from('branches')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id);

  revalidatePath('/admin/settings/branches');
  return { success: true };
}

export async function toggleBranchActive(
  id: string,
  active: boolean
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  await supabase.from('branches').update({ is_active: active }).eq('id', id);

  revalidatePath('/admin/settings/branches');
  return { success: true };
}
