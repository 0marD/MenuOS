'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function markItemReady(itemId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('order_items')
    .update({ is_ready: true })
    .eq('id', itemId);

  if (error) return { error: 'Error al marcar ítem.' };
  revalidatePath('/kitchen');
}

export async function startPreparing(orderId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .update({ status: 'preparing' })
    .eq('id', orderId)
    .eq('status', 'confirmed');

  if (error) return { error: 'Error al actualizar pedido.' };
  revalidatePath('/kitchen');
}

export async function markOrderReadyKitchen(orderId: string) {
  const jar = await cookies();
  const branchId = jar.get('menuos_branch_id')?.value;

  const supabase = await createClient();

  // Mark all items ready first
  await supabase.from('order_items').update({ is_ready: true }).eq('order_id', orderId);

  const { error } = await supabase
    .from('orders')
    .update({ status: 'ready', ready_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) return { error: 'Error al marcar pedido como listo.' };

  // Notify waiter that order is ready
  if (branchId) {
    void supabase.functions.invoke('send-push', {
      body: {
        branch_id: branchId,
        role: 'waiter',
        title: '✅ Pedido listo',
        body: `Pedido #${orderId.slice(-6).toUpperCase()} está listo para servir`,
      },
    });
  }

  revalidatePath('/kitchen');
}
