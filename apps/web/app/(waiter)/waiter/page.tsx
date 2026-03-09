import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WaiterOrderList } from './WaiterOrderList';

export const metadata: Metadata = { title: 'Pedidos — Mesero' };

export default async function WaiterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/pin');

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('organization_id, branch_id')
    .eq('auth_user_id', user.id)
    .single();
  if (!staffUser) redirect('/auth/pin');

  // Fetch active orders (not delivered/cancelled) for this branch
  const query = supabase
    .from('orders')
    .select(`
      id, table_number, status, total, customer_name, round, created_at, notes,
      order_items ( id, name, price, quantity, notes, is_ready )
    `)
    .eq('organization_id', staffUser.organization_id)
    .not('status', 'in', '("delivered","cancelled")')
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (staffUser.branch_id) {
    query.eq('branch_id', staffUser.branch_id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawOrders } = await query;
  const orders = (rawOrders ?? []) as any[];

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-paper">Pedidos activos</h1>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-mono text-white/70">
          {orders.length} pedidos
        </span>
      </div>
      <WaiterOrderList
        orders={orders}
        orgId={staffUser.organization_id}
      />
    </div>
  );
}
