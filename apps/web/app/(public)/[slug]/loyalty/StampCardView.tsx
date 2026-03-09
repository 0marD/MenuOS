'use client';

import { cn } from '@menuos/ui';

interface Program {
  id: string;
  name: string;
  stamps_required: number;
  reward_type: string;
  reward_value: string;
}

interface StampCard {
  id: string;
  stamp_count: number;
  is_complete: boolean;
  completed_at: string | null;
}

interface Reward {
  id: string;
  code: string;
  redeemed_at: string | null;
  expires_at: string | null;
}

interface StampCardViewProps {
  program: Program;
  stampCard: StampCard | null;
  reward: Reward | null;
  orgName: string;
}

export function StampCardView({ program, stampCard, reward, orgName }: StampCardViewProps) {
  const count = stampCard?.stamp_count ?? 0;
  const required = program.stamps_required;
  const isComplete = stampCard?.is_complete ?? false;
  const remaining = Math.max(0, required - count);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink">{program.name}</h1>
        <p className="mt-1 text-sm font-sans text-muted">{orgName}</p>
      </div>

      {/* Stamp grid */}
      <div className="rounded-2xl border border-rule bg-card p-6">
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${Math.min(required, 4)}, 1fr)` }}
          aria-label={`${count} de ${required} sellos`}
        >
          {Array.from({ length: required }, (_, i) => {
            const filled = i < count;
            return (
              <div
                key={i}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-xl border-2 text-2xl transition-all',
                  filled
                    ? 'border-accent bg-accent/10 shadow-sm'
                    : 'border-rule bg-cream'
                )}
                aria-label={filled ? `Sello ${i + 1} obtenido` : `Sello ${i + 1} pendiente`}
              >
                {filled ? '⭐' : ''}
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          {isComplete ? (
            <p className="font-display text-lg font-bold text-accent">¡Tarjeta completa! 🎉</p>
          ) : (
            <p className="text-sm font-sans text-muted">
              Te faltan <strong className="text-ink">{remaining} sello{remaining !== 1 ? 's' : ''}</strong> para tu recompensa
            </p>
          )}
        </div>
      </div>

      {/* Reward info */}
      <div className="rounded-xl border border-rule bg-cream p-4">
        <p className="text-xs font-mono text-muted uppercase tracking-wider">Tu recompensa</p>
        <p className="mt-1 font-display text-lg font-bold text-ink">{program.reward_value}</p>
      </div>

      {/* Reward code */}
      {isComplete && reward && (
        <div className={cn(
          'rounded-2xl border-2 p-5 text-center',
          reward.redeemed_at ? 'border-rule bg-cream opacity-60' : 'border-accent bg-accent/5'
        )}>
          <p className="text-sm font-sans font-medium text-ink mb-2">
            {reward.redeemed_at ? 'Recompensa usada' : 'Código de recompensa'}
          </p>
          <p className="font-mono text-3xl font-black tracking-widest text-accent">
            {reward.code}
          </p>
          {reward.expires_at && !reward.redeemed_at && (
            <p className="mt-2 text-xs font-sans text-muted">
              Válido hasta: {new Intl.DateTimeFormat('es-MX', {
                day: 'numeric', month: 'long', year: 'numeric',
              }).format(new Date(reward.expires_at))}
            </p>
          )}
          {reward.redeemed_at && (
            <p className="mt-2 text-xs font-sans text-muted">
              Canjeado: {new Intl.DateTimeFormat('es-MX', {
                day: 'numeric', month: 'long',
              }).format(new Date(reward.redeemed_at))}
            </p>
          )}
          {!stampCard && (
            <p className="mt-3 text-xs font-sans text-muted">
              Muestra este código al mesero para obtener tu recompensa.
            </p>
          )}
        </div>
      )}

      {!stampCard && (
        <p className="text-center text-xs font-sans text-muted">
          Regístrate la próxima vez que visites {orgName} para comenzar a acumular sellos.
        </p>
      )}
    </div>
  );
}
