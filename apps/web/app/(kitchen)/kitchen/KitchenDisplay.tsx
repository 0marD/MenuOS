'use client';

import { CheckCheck } from 'lucide-react';
import { useCallback, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { KDS_ALERT_MINUTES } from '@menuos/shared';
import type { Tables } from '@menuos/database';
import { markItemReady, markOrderReadyKitchen, startPreparing } from './actions';

type Order = Tables<'orders'> & { order_items: Tables<'order_items'>[] };

function minutesSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

function playNewOrderBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // AudioContext not available (SSR or restricted environment)
  }
}

interface KitchenDisplayProps {
  initialOrders: Order[];
  branchId: string;
}

export function KitchenDisplay({ initialOrders, branchId }: KitchenDisplayProps) {
  const [, startTransition] = useTransition();
  const router = useRouter();
  const knownOrderIds = useRef(new Set(initialOrders.map((o) => o.id)));

  const refresh = useCallback(() => router.refresh(), [router]);

  const handleOrderChange = useCallback(
    (payload: { eventType: string; new: Record<string, unknown> }) => {
      if (payload.eventType === 'INSERT' && payload.new?.id) {
        const newId = payload.new.id as string;
        if (!knownOrderIds.current.has(newId)) {
          knownOrderIds.current.add(newId);
          playNewOrderBeep();
        }
      }
      refresh();
    },
    [refresh],
  );

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`kitchen:${branchId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `branch_id=eq.${branchId}` },
        handleOrderChange,
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [branchId, handleOrderChange, refresh]);

  const orders = initialOrders.filter((o) => ['confirmed', 'preparing'].includes(o.status));

  if (orders.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <CheckCheck className="h-16 w-16 text-green-500/40" />
        <p className="font-display text-2xl font-bold text-white/40">Sin pedidos pendientes</p>
      </div>
    );
  }

  return (
    <div className="grid auto-rows-min gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {orders.map((order) => {
        const mins = minutesSince(order.created_at);
        const overdue = mins >= KDS_ALERT_MINUTES;
        const allReady = order.order_items.every((i) => i.is_ready);

        return (
          <div
            key={order.id}
            className={`flex flex-col rounded-xl border-2 bg-neutral-900 ${
              overdue ? 'border-red-500' : allReady ? 'border-green-500' : 'border-neutral-700'
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between rounded-t-[10px] px-4 py-2 ${
                overdue ? 'bg-red-500' : allReady ? 'bg-green-600' : 'bg-neutral-700'
              }`}
            >
              <span className="font-mono text-sm font-bold text-white">
                #{order.id.slice(-6).toUpperCase()}
              </span>
              <span className={`font-mono text-sm font-bold text-white ${overdue ? 'animate-pulse' : ''}`}>
                {mins}m
              </span>
            </div>

            {/* Items */}
            <ul className="flex-1 divide-y divide-neutral-800 px-4">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <button
                    onClick={() => startTransition(async () => { await markItemReady(item.id); })}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      item.is_ready
                        ? 'border-green-500 bg-green-500'
                        : 'border-neutral-500 hover:border-green-400'
                    }`}
                    aria-label={`Marcar ${item.name} como listo`}
                  >
                    {item.is_ready && <CheckCheck className="h-3.5 w-3.5 text-white" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${item.is_ready ? 'text-neutral-500 line-through' : 'text-white'}`}>
                      {item.quantity}× {item.name}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-yellow-400">{item.notes}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="px-4 pb-4">
              {order.status === 'confirmed' ? (
                <button
                  onClick={() => startTransition(async () => { await startPreparing(order.id); })}
                  className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Comenzar preparación
                </button>
              ) : allReady ? (
                <button
                  onClick={() => startTransition(async () => { await markOrderReadyKitchen(order.id); })}
                  className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700"
                >
                  ✓ Listo para mesa
                </button>
              ) : (
                <p className="py-1 text-center text-xs text-neutral-500">
                  Preparando…
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
