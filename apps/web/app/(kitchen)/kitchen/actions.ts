'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuthSession } from '@/lib/auth/get-session';

export async function markItemReady(
  itemId: string,
  orderId: string
): Promise<{ success: boolean }> {
  try {
    const session = await requireAuthSession();
    if (!['kitchen', 'manager', 'super_admin'].includes(session.role)) {
      return { success: false };
    }
  } catch {
    return { success: false };
  }

  const supabase = await createClient();

  await supabase.from('order_items').update({ is_ready: true }).eq('id', itemId);

  // Transition order to 'preparing' if still 'confirmed'
  await supabase
    .from('orders')
    .update({ status: 'preparing' })
    .eq('id', orderId)
    .eq('status', 'confirmed');

  return { success: true };
}

export async function markTicketReady(orderId: string): Promise<{ success: boolean }> {
  try {
    const session = await requireAuthSession();
    if (!['kitchen', 'manager', 'super_admin'].includes(session.role)) {
      return { success: false };
    }
  } catch {
    return { success: false };
  }

  const supabase = await createClient();

  await supabase.from('order_items').update({ is_ready: true }).eq('order_id', orderId);

  await supabase
    .from('orders')
    .update({ status: 'ready', ready_at: new Date().toISOString() })
    .eq('id', orderId);

  await supabase.from('order_status_history').insert({
    order_id: orderId,
    status: 'ready',
  });

  return { success: true };
}
