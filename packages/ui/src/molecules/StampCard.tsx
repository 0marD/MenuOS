import * as React from 'react';
import { cn } from '../lib/utils';

interface StampCardProps {
  totalStamps: number;
  earnedStamps: number;
  rewardDescription: string;
  restaurantName?: string;
  className?: string;
}

function StampCard({
  totalStamps,
  earnedStamps,
  rewardDescription,
  restaurantName,
  className,
}: StampCardProps) {
  const progress = Math.min(earnedStamps / totalStamps, 1);
  const remaining = Math.max(totalStamps - earnedStamps, 0);

  return (
    <div
      className={cn(
        'rounded-xl border border-rule bg-card p-5 shadow-sm',
        className
      )}
      role="region"
      aria-label="Tarjeta de sellos de fidelidad"
    >
      {restaurantName && (
        <p className="mb-3 text-xs font-mono uppercase tracking-wider text-muted">
          {restaurantName}
        </p>
      )}
      <div
        className="mb-4 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${totalStamps}, 1fr)` }}
        aria-label={`${earnedStamps} de ${totalStamps} sellos`}
      >
        {Array.from({ length: totalStamps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'aspect-square rounded-full border-2 transition-all',
              i < earnedStamps
                ? 'border-accent bg-accent'
                : 'border-rule bg-background'
            )}
            aria-label={i < earnedStamps ? 'Sello obtenido' : 'Sello pendiente'}
          />
        ))}
      </div>
      <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-rule">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
          role="progressbar"
          aria-valuenow={earnedStamps}
          aria-valuemin={0}
          aria-valuemax={totalStamps}
        />
      </div>
      <p className="mt-2 text-xs font-sans text-muted">
        {remaining > 0
          ? `${remaining} sello${remaining !== 1 ? 's' : ''} para: ${rewardDescription}`
          : `\u00a1Listo para canjear: ${rewardDescription}!`}
      </p>
    </div>
  );
}

export { StampCard };
