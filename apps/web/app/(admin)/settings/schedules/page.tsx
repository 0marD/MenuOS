import type { Metadata } from 'next';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import { ScheduleManager } from './ScheduleManager';

export const metadata: Metadata = { title: 'Horarios' };

export default async function SchedulesPage() {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { data: branches } = await supabase
    .from('branches')
    .select('*')
    .eq('organization_id', org.id)
    .order('created_at');

  const branchIds = (branches ?? []).map((b) => b.id);
  const { data: allSchedules } = branchIds.length
    ? await supabase.from('branch_schedules').select('*').in('branch_id', branchIds)
    : { data: [] as { id: string; branch_id: string; day_of_week: number; opens_at: string | null; closes_at: string | null; is_closed: boolean }[] };

  const schedulesByBranch: Record<string, NonNullable<typeof allSchedules>> = {};
  for (const s of allSchedules ?? []) {
    if (!schedulesByBranch[s.branch_id]) schedulesByBranch[s.branch_id] = [];
    schedulesByBranch[s.branch_id]!.push(s);
  }

  return <ScheduleManager branches={branches ?? []} schedulesByBranch={schedulesByBranch} />;
}
