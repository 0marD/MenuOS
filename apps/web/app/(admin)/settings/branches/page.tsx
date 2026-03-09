import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BranchManager } from './BranchManager';

export const metadata: Metadata = { title: 'Sucursales — Configuración' };

export default async function BranchesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('organization_id, role')
    .eq('auth_user_id', user.id)
    .single();
  if (!staffUser) redirect('/auth/login');

  const { data: branches } = await supabase
    .from('branches')
    .select('id, name, address, timezone, is_active, is_temporarily_closed, created_at')
    .eq('organization_id', staffUser.organization_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  const isAdmin = staffUser.role === 'super_admin';

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Sucursales</h2>
      <BranchManager
        branches={branches ?? []}
        orgId={staffUser.organization_id}
        isAdmin={isAdmin}
      />
    </div>
  );
}
