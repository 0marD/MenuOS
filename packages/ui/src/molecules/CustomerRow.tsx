import * as React from 'react';
import { cn } from '../lib/utils';
import { Badge } from '../atoms/Badge';

type Segment = 'new' | 'frequent' | 'dormant';

const segmentConfig: Record<Segment, { label: string; variant: 'default' | 'success' | 'muted' }> = {
  new: { label: 'Nuevo', variant: 'default' },
  frequent: { label: 'Frecuente', variant: 'success' },
  dormant: { label: 'Dormido', variant: 'muted' },
};

interface CustomerRowProps {
  name: string;
  phone: string;
  segment: Segment;
  visitCount: number;
  lastVisit: string;
  onClick?: () => void;
  className?: string;
}

export function CustomerRow({
  name,
  phone,
  segment,
  visitCount,
  lastVisit,
  onClick,
  className,
}: CustomerRowProps) {
  const { label, variant } = segmentConfig[segment];
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={cn(
        'flex items-center gap-4 border-b border-rule px-4 py-3 last:border-0',
        onClick && 'cursor-pointer hover:bg-cream',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream font-mono text-xs text-muted">
        {initials}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <p className="truncate text-sm font-medium text-ink">{name}</p>
        <p className="font-mono text-xs text-muted">{phone}</p>
      </div>
      <div className="hidden sm:flex flex-col items-end gap-1">
        <Badge variant={variant}>{label}</Badge>
        <span className="font-mono text-[10px] text-muted">
          {visitCount} visitas · {lastVisit}
        </span>
      </div>
    </div>
  );
}
