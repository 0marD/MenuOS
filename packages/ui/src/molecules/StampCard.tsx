import * as React from 'react';
import { cn } from '../lib/utils';

interface StampCardProps {
  stampsEarned: number;
  stampsRequired: number;
  rewardDescription: string;
  programName: string;
  expiresAt?: string | null;
  className?: string;
}

export function StampCard({
  stampsEarned,
  stampsRequired,
  rewardDescription,
  programName,
  expiresAt,
  className,
}: StampCardProps) {
  const progress = Math.min(stampsEarned / stampsRequired, 1);
  const remaining = Math.max(stampsRequired - stampsEarned, 0);

  return (
    <div
      className={cn(
        'rounded border border-rule bg-paper p-5 shadow-sm',
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Programa</p>
          <h3 className="font-display text-lg font-bold text-ink">{programName}</h3>
        </div>
        <div className="text-right">
          <span className="font-display text-3xl font-black text-accent">{stampsEarned}</span>
          <span className="font-mono text-sm text-muted">/{stampsRequired}</span>
        </div>
      </div>

      <div className="mb-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(stampsRequired, 10)}, 1fr)` }}>
        {Array.from({ length: stampsRequired }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'aspect-square rounded-full border-2 transition-colors',
              i < stampsEarned
                ? 'border-accent bg-accent'
                : 'border-rule bg-cream',
            )}
            aria-label={i < stampsEarned ? 'Sello obtenido' : 'Sello pendiente'}
          />
        ))}
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-ink">
        {remaining > 0
          ? `Te faltan ${remaining} ${remaining === 1 ? 'sello' : 'sellos'} para: ${rewardDescription}`
          : `¡Recompensa desbloqueada! ${rewardDescription}`}
      </p>

      {expiresAt && (
        <p className="mt-1 font-mono text-[10px] text-muted">Expira: {expiresAt}</p>
      )}
    </div>
  );
}
