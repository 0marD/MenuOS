import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { WaiterOrderList } from './WaiterOrderList';
import { TableMap } from './TableMap';
import { WaiterTabs } from './WaiterTabs';
import { logoutPin } from '@/lib/auth/pin-actions';

export default async function WaiterPage() {
  const jar = await cookies();
  const staffId = jar.get('menuos_staff_id')!.value;
  const branchId = jar.get('menuos_branch_id')!.value;
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [{ data: staff }, { data: orders }, { data: tables }] = await Promise.all([
    supabase.from('staff_users').select('name').eq('id', staffId).single(),
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('branch_id', branchId)
      .gte('created_at', today.toISOString())
      .order('created_at'),
    supabase
      .from('restaurant_tables')
      .select('id, name, zone, is_active, qr_token, branch_id, organization_id, created_at, updated_at')
      .eq('branch_id', branchId)
      .eq('is_active', true)
      .order('name'),
  ]);

  const activeCount = (orders ?? []).filter(
    (o) => !['delivered', 'cancelled'].includes(o.status),
  ).length;

  const tableOrders = (orders ?? []).map((o) => ({
    id: o.id,
    table_id: o.table_id,
    status: o.status,
  }));

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-rule bg-paper px-4 py-3">
        <p className="font-display text-lg font-bold text-ink">
          Hola, {staff?.name ?? 'Mesero'} 👋
        </p>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
              {activeCount}
            </span>
          )}
          <form action={logoutPin}>
            <button type="submit" className="text-xs text-muted hover:text-ink">
              Salir
            </button>
          </form>
        </div>
      </header>

      <main className="p-4">
        <WaiterTabs
          ordersView={
            <WaiterOrderList initialOrders={orders ?? []} branchId={branchId} />
          }
          tablesView={
            <TableMap
              tables={tables ?? []}
              initialOrders={tableOrders}
              branchId={branchId}
            />
          }
        />
      </main>
    </div>
  );
}
