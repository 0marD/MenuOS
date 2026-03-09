'use client';

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, ChefHat, Clock } from 'lucide-react';
import { cn } from '@menuos/ui';
import { createClient } from '@/lib/supabase/client';
import { confirmOrder, rejectOrder, markOrderReady } from './actions';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes: string | null;
  is_ready: boolean;
}

interface Order {
  id: string;
  table_number: number | null;
  status: string;
  total: number;
  customer_name: string | null;
  round: number;
  created_at: string;
  notes: string | null;
  order_items: OrderItem[];
}

interface WaiterOrderListProps {
  orders: Order[];
  orgId: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pendiente',   color: 'bg-highlight text-ink' },
  confirmed: { label: 'Confirmado',  color: 'bg-blue/20 text-blue' },
  preparing: { label: 'En cocina',   color: 'bg-accent/20 text-accent' },
  ready:     { label: '¡Listo!',     color: 'bg-green/20 text-green' },
};

function minutesSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function WaiterOrderList({ orders, orgId }: WaiterOrderListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`waiter:${orgId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `organization_id=eq.${orgId}` },
        () => startTransition(() => router.refresh())
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => startTransition(() => router.refresh())
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orgId, router]);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ChefHat className="mb-3 h-10 w-10 text-white/30" aria-hidden="true" />
        <p className="font-display text-lg text-white/60">Sin pedidos activos</p>
        <p className="mt-1 text-sm text-white/40">Los nuevos pedidos aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const mins = minutesSince(order.created_at);
        const isOverdue = mins > 15 && order.status !== 'ready';
        const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: 'bg-white/10 text-white' };

        return (
          <article
            key={order.id}
            className={cn(
              'rounded-xl border p-4 transition-all',
              isOverdue ? 'border-red-500 bg-red-950/40' : 'border-white/10 bg-white/5'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold text-paper">
                  Mesa {order.table_number ?? '—'}
                </span>
                {order.round > 1 && (
                  <span className="text-xs font-mono text-white/50">Ronda {order.round}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', cfg.color)}>
                  {cfg.label}
                </span>
                <span
                  className={cn(
                    'flex items-center gap-1 text-xs font-mono',
                    isOverdue ? 'text-red-400' : 'text-white/50'
                  )}
                >
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {mins}m · {formatTime(order.created_at)}
                </span>
              </div>
            </div>

            {order.customer_name && (
              <p className="mt-0.5 text-xs text-white/50">{order.customer_name}</p>
            )}

            {/* Items */}
            <ul className="mt-3 space-y-1" aria-label="Platillos del pedido">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-1.5">
                    <span
                      className={cn(
                        'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                        item.is_ready ? 'bg-green' : 'bg-white/20'
                      )}
                      aria-label={item.is_ready ? 'Listo' : 'Pendiente'}
                    />
                    <div>
                      <span className="text-sm text-paper">
                        {item.quantity}× {item.name}
                      </span>
                      {item.notes && (
                        <p className="text-xs text-white/50 italic">{item.notes}</p>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-mono text-white/50">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            {order.notes && (
              <p className="mt-2 rounded bg-white/5 px-2 py-1 text-xs text-white/60 italic">
                Nota: {order.notes}
              </p>
            )}

            {/* Total */}
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2">
              <span className="text-xs text-white/50">Total</span>
              <span className="font-mono text-sm font-bold text-paper">
                ${Number(order.total).toFixed(2)}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-3 flex gap-2">
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={() => startTransition(() => rejectOrder(order.id).then(() => router.refresh()))}
                    disabled={isPending}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-500/40 py-2 text-sm font-medium text-red-400 transition hover:bg-red-950/40 disabled:opacity-50"
                    aria-label="Rechazar pedido"
                  >
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                    Rechazar
                  </button>
                  <button
                    onClick={() => startTransition(() => confirmOrder(order.id).then(() => router.refresh()))}
                    disabled={isPending}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent py-2 text-sm font-medium text-white transition hover:bg-accent/80 disabled:opacity-50"
                    aria-label="Confirmar pedido"
                  >
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                    Confirmar
                  </button>
                </>
              )}
              {order.status === 'preparing' && (
                <button
                  onClick={() => startTransition(() => markOrderReady(order.id).then(() => router.refresh()))}
                  disabled={isPending}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-green py-2 text-sm font-medium text-white transition hover:bg-green/80 disabled:opacity-50"
                  aria-label="Marcar como listo"
                >
                  <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  Marcar como listo
                </button>
              )}
              {order.status === 'ready' && (
                <button
                  onClick={() => startTransition(() => markOrderReady(order.id).then(() => router.refresh()))}
                  disabled={isPending}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/10 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  Entregar a mesa
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
