import * as React from 'react';
import { cn } from '../lib/utils';
import { Badge } from '../atoms/Badge';

interface MenuItemCardProps {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isSoldOut?: boolean;
  filters?: string[];
  onSelect?: () => void;
  className?: string;
}

function MenuItemCard({
  name,
  description,
  price,
  imageUrl,
  isSoldOut = false,
  filters = [],
  onSelect,
  className,
}: MenuItemCardProps) {
  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(price);

  return (
    <article
      className={cn(
        'flex gap-3 rounded-lg bg-card p-3 transition-colors',
        !isSoldOut && 'cursor-pointer hover:bg-cream',
        isSoldOut && 'opacity-60',
        className
      )}
      onClick={!isSoldOut ? onSelect : undefined}
      role={!isSoldOut ? 'button' : undefined}
      tabIndex={!isSoldOut ? 0 : undefined}
      onKeyDown={!isSoldOut ? (e) => e.key === 'Enter' && onSelect?.() : undefined}
      aria-label={`${name}, ${formattedPrice}${isSoldOut ? ', agotado' : ''}`}
    >
      {imageUrl && (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
              <Badge variant="soldOut">Agotado</Badge>
            </div>
          )}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold font-sans leading-tight text-foreground">
            {name}
          </h3>
          <span className="shrink-0 text-sm font-medium font-mono text-foreground">
            {formattedPrice}
          </span>
        </div>
        {description && (
          <p className="line-clamp-2 text-xs font-sans text-muted">{description}</p>
        )}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {filters.map((filter) => (
              <Badge key={filter} variant="outline" className="text-[10px] px-1.5 py-0">
                {filter}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export { MenuItemCard };
