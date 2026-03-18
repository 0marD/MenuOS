import type { Metadata } from 'next';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import { OrdersManager } from './OrdersManager';

export const metadata: Metadata = { title: 'Pedidos' };

export default async function OrdersPage() {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('organization_id', org.id)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-5 w-5 text-muted" />
          <h1 className="font-display text-2xl font-bold text-ink">Pedidos</h1>
        </div>
        <Link href="/orders/tables" className="text-sm text-accent hover:underline">
          Gestionar mesas →
        </Link>
      </div>
      <OrdersManager orders={orders ?? []} />
    </div>
  );
}
