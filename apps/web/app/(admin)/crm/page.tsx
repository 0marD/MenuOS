import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import { CustomerTable } from './CustomerTable';

export const metadata: Metadata = { title: 'Clientes' };

export default async function CrmPage() {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('organization_id', org.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center gap-3">
        <Users className="h-5 w-5 text-muted" />
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Clientes</h1>
          <p className="text-sm text-muted">
            {customers?.length ?? 0} clientes registrados
          </p>
        </div>
      </div>
      <CustomerTable customers={customers ?? []} />
    </div>
  );
}
