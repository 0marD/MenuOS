import * as React from 'react';
import { cn } from '../lib/utils';
import { Badge } from '../atoms/Badge';

interface MenuItemCardProps {
  name: string;
  description?: string | null;
  price: string;
  photoUrl?: string | null;
  isAvailable?: boolean;
  isSoldOut?: boolean;
  isSpecial?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  preparationTime?: number | null;
  onClick?: () => void;
  className?: string;
}

export function MenuItemCard({
  name,
  description,
  price,
  photoUrl,
  isAvailable = true,
  isSoldOut = false,
  isSpecial = false,
  isVegetarian = false,
  isGlutenFree = false,
  isSpicy = false,
  preparationTime,
  onClick,
  className,
}: MenuItemCardProps) {
  const unavailable = !isAvailable || isSoldOut;

  return (
    <article
      className={cn(
        'flex gap-4 rounded border border-rule bg-paper p-4 transition-colors',
        onClick && 'cursor-pointer hover:bg-cream',
        unavailable && 'opacity-60',
        className,
      )}
      onClick={onClick}
    >
      {photoUrl && (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded">
          <img
            src={photoUrl}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/60">
              <span className="font-mono text-[9px] uppercase tracking-widest text-white">
                Agotado
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-sans text-sm font-semibold text-ink leading-snug">{name}</h3>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="font-display text-base font-bold text-ink">{price}</span>
            {isSpecial && <Badge variant="default">Especial</Badge>}
          </div>
        </div>

        {description && (
          <p className="text-xs text-muted leading-relaxed line-clamp-2">{description}</p>
        )}

        {(isVegetarian || isGlutenFree || isSpicy) && (
          <div className="mt-1 flex flex-wrap gap-1">
            {isVegetarian && (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-green-700">
                🥦 Vegetariano
              </span>
            )}
            {isGlutenFree && (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-700">
                🌾 Sin gluten
              </span>
            )}
            {isSpicy && (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-red-700">
                🌶️ Picante
              </span>
            )}
          </div>
        )}

        {preparationTime && (
          <p className="mt-auto font-mono text-[10px] uppercase tracking-widest text-muted">
            ~{preparationTime} min
          </p>
        )}
      </div>
    </article>
  );
}
