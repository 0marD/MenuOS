'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireOrgSession, requireAuthSession } from '@/lib/auth/get-session';

interface DayScheduleInput {
  day_of_week: number;
  opens_at: string;
  closes_at: string;
  is_open: boolean;
}

export async function saveSchedules(
  branchId: string,
  orgId: string,
  days: DayScheduleInput[]
): Promise<{ success: boolean; error?: string }> {
  if (!branchId || !orgId) return { success: false, error: 'Datos inválidos' };

  try {
    await requireOrgSession(orgId);
  } catch {
    return { success: false, error: 'Sin autorización' };
  }

  const supabase = await createClient();
  const upsertData = days.map((d) => ({
    branch_id: branchId,
    organization_id: orgId,
    day_of_week: d.day_of_week,
    opens_at: d.opens_at,
    closes_at: d.closes_at,
    is_open: d.is_open,
  }));

  const { error } = await supabase
    .from('branch_schedules')
    .upsert(upsertData, { onConflict: 'branch_id,day_of_week' });

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/settings/schedules');
  return { success: true };
}

export async function toggleTemporarilyClosed(
  branchId: string,
  closed: boolean
): Promise<{ success: boolean }> {
  try {
    await requireAuthSession();
  } catch {
    return { success: false };
  }
  const supabase = await createClient();
  await supabase.from('branches').update({ is_temporarily_closed: closed }).eq('id', branchId);
  revalidatePath('/admin/settings/schedules');
  return { success: true };
}
