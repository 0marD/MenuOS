'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@menuos/ui';
import { createClient } from '@/lib/supabase/client';
import { markItemReady, markTicketReady } from './actions';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes: string | null;
  is_ready: boolean;
}

interface Order {
  id: string;
  table_number: number | null;
  status: string;
  round: number;
  created_at: string;
  notes: string | null;
  customer_name: string | null;
  order_items: OrderItem[];
}

interface KitchenDisplayProps {
  orders: Order[];
  orgId: string;
}

function ElapsedTimer({ createdAt }: { createdAt: string }) {
  const [mins, setMins] = useState(() =>
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMins(Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
    }, 30_000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <span className={cn('font-mono text-xl font-bold tabular-nums', mins >= 15 ? 'text-red-400' : 'text-white/70')}>
      {mins}m
    </span>
  );
}

export function KitchenDisplay({ orders, orgId }: KitchenDisplayProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Realtime
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`kitchen:${orgId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `organization_id=eq.${orgId}` },
        () => startTransition(() => router.refresh())
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'order_items' },
        () => startTransition(() => router.refresh())
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orgId, router]);

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-40px)] items-center justify-center">
        <div className="text-center">
          <CheckCheck className="mx-auto mb-4 h-16 w-16 text-green/40" aria-hidden="true" />
          <p className="font-display text-3xl font-bold text-white/30">Al día</p>
          <p className="mt-2 font-mono text-sm text-white/20">Sin tickets pendientes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
      {orders.map((order) => {
        const mins = Math.floor(
          (Date.now() - new Date(order.created_at).getTime()) / 60000
        );
        const isOverdue = mins >= 15;
        const allReady = order.order_items.every((i) => i.is_ready);

        return (
          <article
            key={order.id}
            className={cn(
              'flex flex-col rounded-2xl border-2 p-4',
              isOverdue
                ? 'animate-pulse border-red-500 bg-red-950/30'
                : 'border-white/10 bg-zinc-900'
            )}
          >
            {/* Ticket header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-display text-4xl font-black text-white">
                  {order.table_number ?? '?'}
                </span>
                <div>
                  <p className="text-xs font-mono text-white/40 uppercase">Mesa</p>
                  {order.round > 1 && (
                    <p className="text-xs font-mono text-white/40">Ronda {order.round}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOverdue && (
                  <AlertTriangle className="h-5 w-5 text-red-400" aria-label="Tiempo excedido" />
                )}
                <ElapsedTimer createdAt={order.created_at} />
              </div>
            </div>

            {order.notes && (
              <p className="mt-2 rounded bg-white/5 px-2 py-1 text-sm italic text-white/60">
                ⚠ {order.notes}
              </p>
            )}

            {/* Items */}
            <ul className="mt-4 flex-1 space-y-2" aria-label="Platillos">
              {order.order_items.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    'flex items-start justify-between gap-3 rounded-lg px-3 py-2 transition-all',
                    item.is_ready ? 'bg-green/10 opacity-50' : 'bg-white/5'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      'text-lg font-bold leading-tight',
                      item.is_ready ? 'text-green line-through' : 'text-white'
                    )}>
                      {item.quantity}× {item.name}
                    </p>
                    {item.notes && (
                      <p className="text-sm text-yellow-400 italic">{item.notes}</p>
                    )}
                  </div>
                  {!item.is_ready && (
                    <button
                      onClick={() =>
                        startTransition(() =>
                          markItemReady(item.id, order.id).then(() => router.refresh())
                        )
                      }
                      disabled={isPending}
                      className="shrink-0 rounded-lg bg-green px-3 py-1 text-sm font-bold text-white transition hover:bg-green/80 disabled:opacity-50"
                      aria-label={`Marcar ${item.name} como listo`}
                    >
                      ✓
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {/* Mark full ticket ready */}
            <button
              onClick={() =>
                startTransition(() =>
                  markTicketReady(order.id).then(() => router.refresh())
                )
              }
              disabled={isPending}
              className={cn(
                'mt-4 w-full rounded-xl py-3 text-base font-bold transition',
                allReady
                  ? 'bg-green text-white hover:bg-green/80'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              )}
              aria-label="Marcar ticket completo como listo"
            >
              {allReady ? '✓ Ticket listo — Notificar mesero' : 'Marcar todo como listo'}
            </button>
          </article>
        );
      })}
    </div>
  );
}
