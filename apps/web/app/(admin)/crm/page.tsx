import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CustomerTable } from './CustomerTable';

export const metadata: Metadata = { title: 'Clientes — MenuOS Admin' };

export default async function CrmPage() {
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

  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, phone_last4, segment, visit_count, last_visit_at, is_opted_in, created_at')
    .eq('organization_id', staffUser.organization_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const { count: totalCount } = await supabase
    .from('customers')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', staffUser.organization_id)
    .is('deleted_at', null);

  const { count: frequentCount } = await supabase
    .from('customers')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', staffUser.organization_id)
    .eq('segment', 'frequent')
    .is('deleted_at', null);

  const { count: dormantCount } = await supabase
    .from('customers')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', staffUser.organization_id)
    .eq('segment', 'dormant')
    .is('deleted_at', null);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Clientes</h1>
      </div>

      {/* Summary metrics */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-rule bg-card p-4">
          <p className="text-xs font-mono text-muted">Total</p>
          <p className="mt-1 text-2xl font-bold font-display text-ink">{totalCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-rule bg-card p-4">
          <p className="text-xs font-mono text-muted">Frecuentes</p>
          <p className="mt-1 text-2xl font-bold font-display text-green">{frequentCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-rule bg-card p-4">
          <p className="text-xs font-mono text-muted">Dormidos</p>
          <p className="mt-1 text-2xl font-bold font-display text-muted">{dormantCount ?? 0}</p>
        </div>
      </div>

      <CustomerTable customers={customers ?? []} />
    </div>
  );
}
