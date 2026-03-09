import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TableEditor } from './TableEditor';

export const metadata: Metadata = { title: 'Mesas — MenuOS Admin' };

export default async function TablesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('organization_id')
    .eq('auth_user_id', user.id)
    .single();
  if (!staffUser) redirect('/auth/login');

  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .eq('organization_id', staffUser.organization_id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('created_at');

  const { data: tables } = await supabase
    .from('restaurant_tables')
    .select('id, branch_id, number, label, zone, capacity, is_active, qr_token')
    .eq('organization_id', staffUser.organization_id)
    .is('deleted_at', null)
    .order('number');

  const { data: org } = await supabase
    .from('organizations')
    .select('slug')
    .eq('id', staffUser.organization_id)
    .single();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Mesas</h1>
      <TableEditor
        branches={branches ?? []}
        tables={tables ?? []}
        orgId={staffUser.organization_id}
        orgSlug={org?.slug ?? ''}
      />
    </div>
  );
}
