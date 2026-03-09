import * as React from 'react';
import { cn } from '../lib/utils';
import { Avatar, AvatarFallback } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';

type CustomerSegment = 'new' | 'frequent' | 'dormant';

interface CustomerRowProps {
  name: string;
  maskedPhone: string;
  segment: CustomerSegment;
  visitCount: number;
  lastVisit: Date;
  onClick?: () => void;
  className?: string;
}

const segmentConfig: Record<CustomerSegment, { label: string; badgeVariant: 'available' | 'highlight' | 'soldOut' }> = {
  new: { label: 'Nuevo', badgeVariant: 'available' },
  frequent: { label: 'Frecuente', badgeVariant: 'highlight' },
  dormant: { label: 'Dormido', badgeVariant: 'soldOut' },
};

function CustomerRow({
  name,
  maskedPhone,
  segment,
  visitCount,
  lastVisit,
  onClick,
  className,
}: CustomerRowProps) {
  const config = segmentConfig[segment];
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const formattedDate = new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
  }).format(lastVisit);

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg p-3 transition-colors',
        onClick && 'cursor-pointer hover:bg-cream',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <Avatar className="h-9 w-9">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium font-sans text-foreground">{name}</p>
        <p className="text-xs font-mono text-muted">{maskedPhone}</p>
      </div>
      <div className="flex items-center gap-3 text-right">
        <div className="hidden sm:block">
          <p className="text-xs font-sans text-muted">{visitCount} visitas</p>
          <p className="text-xs font-mono text-muted">{formattedDate}</p>
        </div>
        <Badge variant={config.badgeVariant}>{config.label}</Badge>
      </div>
    </div>
  );
}

export { CustomerRow, type CustomerSegment };
