import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TeamManager } from './TeamManager';

export const metadata: Metadata = { title: 'Equipo — Configuración' };

export default async function TeamPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('organization_id, role, id')
    .eq('auth_user_id', user.id)
    .single();
  if (!staffUser) redirect('/auth/login');

  const { data: members } = await supabase
    .from('staff_users')
    .select('id, name, email, role, branch_id, is_active, created_at')
    .eq('organization_id', staffUser.organization_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .eq('organization_id', staffUser.organization_id)
    .eq('is_active', true)
    .is('deleted_at', null);

  const isAdmin = staffUser.role === 'super_admin';

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Equipo</h2>
      <TeamManager
        members={members ?? []}
        branches={branches ?? []}
        orgId={staffUser.organization_id}
        currentUserId={staffUser.id}
        isAdmin={isAdmin}
      />
    </div>
  );
}
