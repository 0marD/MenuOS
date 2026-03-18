'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@menuos/ui';
import { formatMXN, formatRelativeDate } from '@menuos/shared';
import type { Tables } from '@menuos/database';

type Order = Tables<'orders'> & {
  order_items: Tables<'order_items'>[];
};

const STATUS_VARIANT: Record<string, 'default' | 'info' | 'warning' | 'success' | 'muted' | 'destructive'> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'default',
  ready: 'success',
  delivered: 'muted',
  cancelled: 'destructive',
} as const;

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const FILTER_OPTIONS = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

interface OrdersManagerProps {
  orders: Order[];
}

export function OrdersManager({ orders }: OrdersManagerProps) {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const totalRevenue = orders
    .filter((o) => o.status === 'delivered')
    .reduce((s, o) => s + o.total_amount, 0);

  const activeCount = orders.filter((o) =>
    ['pending', 'confirmed', 'preparing'].includes(o.status),
  ).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total pedidos', value: orders.length },
          { label: 'Activos', value: activeCount },
          { label: 'Ingresos entregados', value: formatMXN(totalRevenue), mono: true },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-rule bg-paper p-4">
            <p className={`text-xl font-bold text-ink ${m.mono ? 'font-display' : 'font-display'}`}>
              {m.value}
            </p>
            <p className="mt-0.5 text-xs text-muted">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-accent/10 text-accent'
                : 'bg-cream text-muted hover:bg-rule hover:text-ink'
            }`}
          >
            {f === 'all' ? 'Todos' : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No hay pedidos para mostrar.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((order) => (
            <div key={order.id} className="overflow-hidden rounded-xl border border-rule bg-paper">
              <button
                onClick={() => setExpanded((v) => (v === order.id ? null : order.id))}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
                aria-expanded={expanded === order.id}
              >
                {expanded === order.id ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                )}
                <span className="font-mono text-xs text-muted">
                  #{order.id.slice(-6).toUpperCase()}
                </span>
                <Badge variant={STATUS_VARIANT[order.status] ?? 'muted'}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </Badge>
                <span className="flex-1 text-right font-display text-sm font-bold text-ink">
                  {formatMXN(order.total_amount)}
                </span>
                <span className="text-xs text-muted">{formatRelativeDate(order.created_at)}</span>
              </button>

              {expanded === order.id && (
                <div className="border-t border-rule px-4 py-3">
                  <ul className="flex flex-col gap-1.5">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-ink">
                          {item.quantity}× {item.name}
                        </span>
                        <span className="font-mono text-xs text-muted">
                          {formatMXN(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {order.notes && (
                    <p className="mt-2 text-xs text-muted">Nota: {order.notes}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
