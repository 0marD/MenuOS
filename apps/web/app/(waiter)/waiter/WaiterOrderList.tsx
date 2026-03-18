'use client';

import { AlertTriangle, CheckCheck, ChevronDown, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button } from '@menuos/ui';
import { formatMXN, KDS_ALERT_MINUTES } from '@menuos/shared';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@menuos/database';
import { cancelOrder, confirmOrder, deliverOrder } from './actions';

type Order = Tables<'orders'> & { order_items: Tables<'order_items'>[] };

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const STATUS_VARIANT: Record<string, 'default' | 'info' | 'warning' | 'success' | 'muted'> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'default',
  ready: 'success',
  delivered: 'muted',
  cancelled: 'muted',
} as const;

function isOverdue(createdAt: string) {
  return (Date.now() - new Date(createdAt).getTime()) / 60000 > KDS_ALERT_MINUTES;
}

interface WaiterOrderListProps {
  initialOrders: Order[];
  branchId: string;
}

export function WaiterOrderList({ initialOrders, branchId }: WaiterOrderListProps) {
  const [orders] = useState(initialOrders);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const refresh = useCallback(() => router.refresh(), [router]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`waiter:${branchId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `branch_id=eq.${branchId}` },
        () => refresh(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [branchId, refresh]);

  // Alarm for overdue pending orders
  useEffect(() => {
    const overdue = orders.some((o) => o.status === 'pending' && isOverdue(o.created_at));
    if (overdue && 'vibrate' in navigator) navigator.vibrate([200, 100, 200]);
  }, [orders]);

  const active = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const done = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

  function handleAction(fn: (id: string) => Promise<{ error?: string } | undefined>, orderId: string) {
    startTransition(async () => { await fn(orderId); });
  }

  function OrderCard({ order }: { order: Order }) {
    const overdue = order.status === 'pending' && isOverdue(order.created_at);
    return (
      <div className={`overflow-hidden rounded-xl border bg-paper ${overdue ? 'border-red-400' : 'border-rule'}`}>
        <button
          onClick={() => setExpanded((v) => (v === order.id ? null : order.id))}
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          {expanded === order.id ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
          )}
          {overdue && <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />}
          <span className="font-mono text-xs text-muted">#{order.id.slice(-6).toUpperCase()}</span>
          <Badge variant={STATUS_VARIANT[order.status] ?? 'muted'}>
            {STATUS_LABEL[order.status]}
          </Badge>
          <span className="ml-auto font-display text-sm font-bold text-ink">
            {formatMXN(order.total_amount)}
          </span>
        </button>

        {expanded === order.id && (
          <div className="border-t border-rule px-4 py-3">
            <ul className="mb-4 flex flex-col gap-1.5">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span className="text-ink">{item.quantity}× {item.name}</span>
                  <span className="font-mono text-xs text-muted">{formatMXN(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              {order.status === 'pending' && (
                <>
                  <Button size="sm" onClick={() => handleAction(confirmOrder, order.id)}>
                    Confirmar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction(cancelOrder, order.id)}
                    className="gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancelar
                  </Button>
                </>
              )}
              {order.status === 'ready' && (
                <Button
                  size="sm"
                  onClick={() => handleAction(deliverOrder, order.id)}
                  className="gap-1"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Entregar
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-ink">
          Activos ({active.length})
        </h2>
        {active.length === 0 ? (
          <p className="rounded-xl border border-dashed border-rule py-8 text-center text-sm text-muted">
            No hay pedidos activos.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {active.map((o) => <OrderCard key={o.id} order={o} />)}
          </div>
        )}
      </section>

      {done.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-base font-semibold text-muted">
            Completados hoy ({done.length})
          </h2>
          <div className="flex flex-col gap-2 opacity-60">
            {done.slice(0, 10).map((o) => <OrderCard key={o.id} order={o} />)}
          </div>
        </section>
      )}
    </div>
  );
}
