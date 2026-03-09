'use server';

import { createClient } from '@/lib/supabase/server';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  extra?: Record<string, unknown>
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .update({ status, ...extra })
    .eq('id', orderId);

  if (error) return { success: false };

  await supabase.from('order_status_history').insert({
    order_id: orderId,
    status,
  });

  return { success: true };
}

export async function confirmOrder(orderId: string): Promise<{ success: boolean }> {
  return updateOrderStatus(orderId, 'confirmed', { confirmed_at: new Date().toISOString() });
}

export async function rejectOrder(orderId: string): Promise<{ success: boolean }> {
  return updateOrderStatus(orderId, 'cancelled', { cancelled_at: new Date().toISOString() });
}

export async function markOrderReady(orderId: string): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const { data: order } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single();

  if (order?.status === 'ready') {
    return updateOrderStatus(orderId, 'delivered', { delivered_at: new Date().toISOString() });
  }
  return updateOrderStatus(orderId, 'ready', { ready_at: new Date().toISOString() });
}
