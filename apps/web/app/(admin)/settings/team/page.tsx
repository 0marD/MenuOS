import type { Metadata } from 'next';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import { TeamManager } from './TeamManager';

export const metadata: Metadata = { title: 'Equipo' };

export default async function TeamPage() {
  const { org, staffUser } = await requireAdminSession();
  const supabase = await createClient();

  const [{ data: members }, { data: branches }] = await Promise.all([
    supabase
      .from('staff_users')
      .select('*')
      .eq('organization_id', org.id)
      .order('created_at'),
    supabase
      .from('branches')
      .select('id, name')
      .eq('organization_id', org.id)
      .eq('is_active', true),
  ]);

  return (
    <TeamManager
      members={members ?? []}
      branches={branches ?? []}
      currentUserId={staffUser.id}
    />
  );
}
