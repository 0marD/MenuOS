'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function sendPushToRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  branchId: string,
  role: 'waiter' | 'kitchen',
  title: string,
  body: string,
) {
  await supabase.functions.invoke('send-push', {
    body: { branch_id: branchId, role, title, body },
  });
}

async function requireWaiterSession() {
  const jar = await cookies();
  const staffId = jar.get('menuos_staff_id')?.value;
  const branchId = jar.get('menuos_branch_id')?.value;
  if (!staffId || !branchId) throw new Error('Unauthorized');
  return { staffId, branchId };
}

export async function confirmOrder(orderId: string) {
  const { staffId, branchId } = await requireWaiterSession();
  const supabase = await createClient();

  // Fetch order for notification context
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('id', orderId)
    .single();

  const { error } = await supabase
    .from('orders')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) return { error: 'Error al confirmar pedido.' };

  await supabase.from('order_status_history').insert({
    order_id: orderId,
    status: 'confirmed',
    changed_by: staffId,
  });

  // Notify kitchen of new confirmed order
  if (order) {
    void sendPushToRole(
      supabase,
      branchId,
      'kitchen',
      '🍳 Nuevo pedido confirmado',
      `Pedido #${orderId.slice(-6).toUpperCase()} — comenzar preparación`,
    );
  }

  revalidatePath('/waiter');
}

export async function markOrderReady(orderId: string) {
  const { staffId } = await requireWaiterSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .update({ status: 'ready', ready_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) return { error: 'Error al marcar pedido como listo.' };

  await supabase.from('order_status_history').insert({
    order_id: orderId,
    status: 'ready',
    changed_by: staffId,
  });

  revalidatePath('/waiter');
}

export async function deliverOrder(orderId: string) {
  const { staffId } = await requireWaiterSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .update({ status: 'delivered', delivered_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) return { error: 'Error al entregar pedido.' };

  await supabase.from('order_status_history').insert({
    order_id: orderId,
    status: 'delivered',
    changed_by: staffId,
  });

  revalidatePath('/waiter');
}

export async function recordPayment(
  orderId: string,
  method: 'cash' | 'card' | 'transfer',
) {
  await requireWaiterSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .update({ payment_method: method, paid_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) return { error: 'Error al registrar pago.' };

  revalidatePath('/waiter');
}

export async function cancelOrder(orderId: string) {
  const { staffId } = await requireWaiterSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) return { error: 'Error al cancelar pedido.' };

  await supabase.from('order_status_history').insert({
    order_id: orderId,
    status: 'cancelled',
    changed_by: staffId,
  });

  revalidatePath('/waiter');
}
