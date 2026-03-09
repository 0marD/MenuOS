'use client';

import { useState } from 'react';
import { Badge } from '@menuos/ui/atoms/Badge';
import { cn } from '@menuos/ui';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  table_number: number | null;
  status: string;
  total: number;
  round: number;
  created_at: string;
  customer_name: string | null;
  order_items: OrderItem[];
}

interface OrdersManagerProps {
  orders: Order[];
  orgId: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' | 'highlight' | 'available' }> = {
  pending:   { label: 'Pendiente',  variant: 'highlight' },
  confirmed: { label: 'Confirmado', variant: 'secondary' },
  preparing: { label: 'En cocina',  variant: 'secondary' },
  ready:     { label: 'Listo',      variant: 'available' },
  delivered: { label: 'Entregado',  variant: 'default' },
  cancelled: { label: 'Cancelado',  variant: 'destructive' },
};

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'preparing', label: 'En cocina' },
  { value: 'ready', label: 'Listos' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'cancelled', label: 'Cancelados' },
] as const;

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export function OrdersManager({ orders }: OrdersManagerProps) {
  const [filter, setFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div role="tablist" aria-label="Filtrar pedidos" className="flex gap-1 overflow-x-auto rounded-lg border border-rule bg-cream p-1">
        {STATUS_FILTERS.map(({ value, label }) => {
          const count = value === 'all' ? orders.length : orders.filter((o) => o.status === value).length;
          return (
            <button
              key={value}
              role="tab"
              aria-selected={filter === value}
              onClick={() => setFilter(value)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-sans transition-colors',
                filter === value ? 'bg-paper font-medium text-ink shadow-sm' : 'text-muted hover:text-ink'
              )}
            >
              {label}
              {count > 0 && (
                <span className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-mono',
                  filter === value ? 'bg-accent text-white' : 'bg-rule text-muted'
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-rule py-16 text-center">
          <p className="text-sm font-sans text-muted">Sin pedidos en este estado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending!;
            const isOpen = expanded === order.id;

            return (
              <div key={order.id} className="overflow-hidden rounded-xl border border-rule bg-card">
                <button
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-cream transition-colors"
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-lg font-bold text-ink w-10 shrink-0">
                    {order.table_number ?? '?'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      {order.customer_name && (
                        <span className="text-xs text-muted truncate">{order.customer_name}</span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-muted mt-0.5">
                      {formatTime(order.created_at)}
                      {order.round > 1 && ` · Ronda ${order.round}`}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-ink shrink-0">
                    ${Number(order.total).toFixed(2)}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-rule bg-cream/50 px-4 py-3">
                    <ul className="space-y-1">
                      {order.order_items.map((item) => (
                        <li key={item.id} className="flex justify-between text-sm font-sans">
                          <span className="text-ink">{item.quantity}× {item.name}</span>
                          <span className="font-mono text-muted">${(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
