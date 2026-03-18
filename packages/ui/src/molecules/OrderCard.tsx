import * as React from 'react';
import { cn } from '../lib/utils';
import { Badge } from '../atoms/Badge';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'success' | 'info' | 'warning' | 'muted' | 'destructive' }> = {
  pending: { label: 'Pendiente', variant: 'warning' },
  confirmed: { label: 'Confirmado', variant: 'info' },
  preparing: { label: 'Preparando', variant: 'default' },
  ready: { label: 'Listo', variant: 'success' },
  delivered: { label: 'Entregado', variant: 'muted' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

interface OrderCardProps {
  orderId: string;
  tableNumber?: string | null;
  status: OrderStatus;
  totalAmount: string;
  itemCount: number;
  createdAt: string;
  isOverdue?: boolean;
  onClick?: () => void;
  className?: string;
}

export function OrderCard({
  orderId,
  tableNumber,
  status,
  totalAmount,
  itemCount,
  createdAt,
  isOverdue,
  onClick,
  className,
}: OrderCardProps) {
  const { label, variant } = statusConfig[status];

  return (
    <article
      className={cn(
        'rounded border border-rule bg-paper p-4 transition-colors',
        onClick && 'cursor-pointer hover:bg-cream',
        isOverdue && 'border-red-400 bg-red-50',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted">#{orderId.slice(-6).toUpperCase()}</span>
            {tableNumber && (
              <span className="font-mono text-xs font-medium text-ink">Mesa {tableNumber}</span>
            )}
          </div>
          <p className="text-sm text-muted">
            {itemCount} {itemCount === 1 ? 'platillo' : 'platillos'} · {createdAt}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="font-display text-base font-bold text-ink">{totalAmount}</span>
          <Badge variant={variant}>{label}</Badge>
        </div>
      </div>
      {isOverdue && (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-red-600">
          Tiempo excedido
        </p>
      )}
    </article>
  );
}
