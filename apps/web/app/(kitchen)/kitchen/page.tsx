import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { KitchenDisplay } from './KitchenDisplay';

export const metadata: Metadata = { title: 'Cocina — MenuOS KDS' };

export default async function KitchenPage() {
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

  // Fetch confirmed/preparing orders (not pending/ready/done)
  const query = supabase
    .from('orders')
    .select(`
      id, table_number, status, round, created_at, notes, customer_name,
      order_items ( id, name, quantity, notes, is_ready )
    `)
    .eq('organization_id', staffUser.organization_id)
    .in('status', ['confirmed', 'preparing'])
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (staffUser.branch_id) {
    query.eq('branch_id', staffUser.branch_id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawOrders } = await query;
  const orders = (rawOrders ?? []) as any[];

  return (
    <KitchenDisplay
      orders={orders}
      orgId={staffUser.organization_id}
    />
  );
}
