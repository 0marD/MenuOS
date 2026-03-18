'use client';

import { StampCard } from '@menuos/ui';
import type { Tables } from '@menuos/database';

type Program = Tables<'loyalty_programs'>;
type Card = Tables<'stamp_cards'>;
type Reward = Tables<'rewards'>;

interface StampCardViewProps {
  program: Program;
  card: Card | null;
  pendingRewards: Reward[];
  customerName: string;
}

export function StampCardView({ program, card, pendingRewards, customerName }: StampCardViewProps) {
  const stampsCount = card?.stamps_count ?? 0;
  const remaining = program.stamps_required - stampsCount;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">{program.name}</h1>
        <p className="mt-1 text-sm text-muted">Hola, {customerName}</p>
      </div>

      <StampCard
        stampsEarned={stampsCount}
        stampsRequired={program.stamps_required}
        rewardDescription={program.reward_description}
        programName={program.name}
      />

      <div className="rounded-xl border border-rule bg-paper p-4 text-center">
        {stampsCount >= program.stamps_required ? (
          <p className="font-display text-lg font-bold text-accent">
            🎉 ¡Tarjeta completa!
          </p>
        ) : (
          <>
            <p className="font-display text-3xl font-bold text-ink">{remaining}</p>
            <p className="text-sm text-muted">
              sello{remaining !== 1 ? 's' : ''} para tu recompensa
            </p>
          </>
        )}
        <p className="mt-2 text-xs text-muted">{program.reward_description}</p>
      </div>

      {pendingRewards.length > 0 && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="mb-3 font-display font-semibold text-ink">Recompensas pendientes</p>
          {pendingRewards.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded border border-rule bg-paper px-4 py-3">
              <p className="text-sm text-ink">{program.reward_description}</p>
              <p className="font-mono text-sm font-bold text-accent">{r.code}</p>
            </div>
          ))}
          <p className="mt-2 text-xs text-muted">Muestra este código al mesero para canjear tu recompensa.</p>
        </div>
      )}
    </div>
  );
}
