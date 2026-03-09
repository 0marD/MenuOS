import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ScheduleManager } from './ScheduleManager';

export const metadata: Metadata = { title: 'Horarios — Configuración' };

export default async function SchedulesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('organization_id')
    .eq('auth_user_id', user.id)
    .single();
  if (!staffUser) redirect('/auth/login');

  const { data: branches } = await supabase
    .from('branches')
    .select('id, name, is_temporarily_closed, closed_message')
    .eq('organization_id', staffUser.organization_id)
    .eq('is_active', true)
    .is('deleted_at', null);

  // Fetch schedules for all branches
  const branchIds = (branches ?? []).map((b) => b.id);
  const { data: schedules } = branchIds.length > 0
    ? await supabase
        .from('branch_schedules')
        .select('*')
        .in('branch_id', branchIds)
    : { data: [] };

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Horarios</h2>
      <ScheduleManager
        branches={branches ?? []}
        schedules={schedules ?? []}
        orgId={staffUser.organization_id}
      />
    </div>
  );
}
