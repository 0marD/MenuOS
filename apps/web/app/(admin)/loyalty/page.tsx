import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Fidelidad — MenuOS Admin' };

export default function LoyaltyPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Programa de Fidelidad</h1>
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-rule py-20 text-center">
        <p className="text-sm font-sans text-muted">Fidelidad — Fase 3</p>
      </div>
    </div>
  );
}
