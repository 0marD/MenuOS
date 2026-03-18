import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { KitchenDisplay } from './KitchenDisplay';
import { logoutPin } from '@/lib/auth/pin-actions';

export default async function KitchenPage() {
  const jar = await cookies();
  const branchId = jar.get('menuos_branch_id')!.value;
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('branch_id', branchId)
    .in('status', ['confirmed', 'preparing'])
    .gte('created_at', today.toISOString())
    .order('created_at');

  return (
    <div className="flex h-screen flex-col bg-neutral-950">
      <header className="flex shrink-0 items-center justify-between border-b border-neutral-800 px-4 py-3">
        <p className="font-display text-lg font-bold text-white">Cocina</p>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-neutral-400">
            {orders?.length ?? 0} pedidos
          </span>
          <form action={logoutPin}>
            <button type="submit" className="text-xs text-neutral-400 hover:text-white">
              Salir
            </button>
          </form>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        <KitchenDisplay initialOrders={orders ?? []} branchId={branchId} />
      </div>
    </div>
  );
}
