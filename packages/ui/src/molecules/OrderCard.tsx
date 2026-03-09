import * as React from 'react';
import { cn } from '../lib/utils';
import { Badge } from '../atoms/Badge';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface OrderCardProps {
  orderNumber: string;
  tableNumber?: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: Date;
  onStatusChange?: (status: OrderStatus) => void;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; badgeVariant: 'default' | 'secondary' | 'outline' | 'highlight' }> = {
  pending: { label: 'Pendiente', badgeVariant: 'secondary' },
  confirmed: { label: 'Confirmado', badgeVariant: 'default' },
  preparing: { label: 'Preparando', badgeVariant: 'highlight' },
  ready: { label: 'Listo', badgeVariant: 'default' },
  delivered: { label: 'Entregado', badgeVariant: 'outline' },
};

function OrderCard({
  orderNumber,
  tableNumber,
  status,
  items,
  createdAt,
  className,
}: OrderCardProps) {
  const config = statusConfig[status];
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const formattedTotal = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(total);

  const timeAgo = Math.floor((Date.now() - createdAt.getTime()) / 60000);

  return (
    <article className={cn('rounded-lg border border-border bg-card p-4', className)}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-muted">#{orderNumber}</span>
          {tableNumber && (
            <span className="ml-2 text-xs font-sans text-muted">Mesa {tableNumber}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted">{timeAgo}min</span>
          <Badge variant={config.badgeVariant as Parameters<typeof Badge>[0]['variant']}>
            {config.label}
          </Badge>
        </div>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-start justify-between gap-2 text-sm font-sans">
            <span className="text-foreground">
              <span className="font-medium">{item.quantity}&times;</span> {item.name}
              {item.notes && (
                <span className="block text-xs text-muted">&rarr; {item.notes}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-end border-t border-border pt-2">
        <span className="text-sm font-semibold font-mono">{formattedTotal}</span>
      </div>
    </article>
  );
}

export { OrderCard, type OrderStatus };
