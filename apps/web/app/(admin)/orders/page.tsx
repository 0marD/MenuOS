import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OrdersManager } from './OrdersManager';

export const metadata: Metadata = { title: 'Pedidos — MenuOS Admin' };

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('organization_id')
    .eq('auth_user_id', user.id)
    .single();
  if (!staffUser) redirect('/auth/login');

  const orgId = staffUser.organization_id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Today's orders
  const { data: rawOrders } = await supabase
    .from('orders')
    .select(`
      id, table_number, status, total, round, created_at, customer_name,
      order_items ( id, name, price, quantity )
    `)
    .eq('organization_id', orgId)
    .gte('created_at', today.toISOString())
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orders = (rawOrders ?? []) as any[];

  // Metrics
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const totalRevenue = deliveredOrders.reduce((s: number, o: { total: number }) => s + Number(o.total), 0);
  const avgTicket = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;

  // Top items
  const itemCounts: Record<string, { name: string; count: number }> = {};
  for (const order of deliveredOrders) {
    for (const item of order.order_items ?? []) {
      if (!itemCounts[item.name]) itemCounts[item.name] = { name: item.name, count: 0 };
      itemCounts[item.name]!.count += item.quantity;
    }
  }
  const topItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Pedidos</h1>

      {/* Today's metrics */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Pedidos hoy', value: orders.length },
          { label: 'Entregados', value: deliveredOrders.length },
          { label: 'Ingresos hoy', value: `$${totalRevenue.toFixed(0)}` },
          { label: 'Ticket promedio', value: avgTicket > 0 ? `$${avgTicket.toFixed(0)}` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-rule bg-card p-4">
            <p className="text-xs font-mono text-muted">{label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OrdersManager orders={orders} orgId={orgId} />
        </div>

        {/* Top items sidebar */}
        {topItems.length > 0 && (
          <aside>
            <h2 className="mb-3 font-display text-base font-bold text-ink">
              Más pedidos hoy
            </h2>
            <div className="rounded-xl border border-rule bg-card overflow-hidden">
              <ul className="divide-y divide-rule">
                {topItems.map((item, i) => (
                  <li key={item.name} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted w-4">{i + 1}</span>
                      <span className="text-sm font-sans text-ink">{item.name}</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-accent">{item.count}×</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
