'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import type { ScheduleInput } from '@menuos/shared';

export async function upsertSchedules(branchId: string, schedules: ScheduleInput[]) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  // Verify branch belongs to org
  const { data: branch } = await supabase
    .from('branches')
    .select('id')
    .eq('id', branchId)
    .eq('organization_id', org.id)
    .single();

  if (!branch) return { error: 'Sucursal no encontrada.' };

  const upserts = schedules.map((s) =>
    supabase
      .from('branch_schedules')
      .upsert(
        {
          branch_id: branchId,
          day_of_week: s.day_of_week,
          opens_at: s.opens_at ?? null,
          closes_at: s.closes_at ?? null,
          is_closed: s.is_closed,
        },
        { onConflict: 'branch_id,day_of_week' },
      ),
  );

  await Promise.all(upserts);
  revalidatePath('/settings/schedules');
}

export async function toggleBranchTemporaryClosed(branchId: string, isClosed: boolean) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('branches')
    .update({ is_temporarily_closed: isClosed })
    .eq('id', branchId)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al cambiar estado.' };
  revalidatePath('/settings/schedules');
}
