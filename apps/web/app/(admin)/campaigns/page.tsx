import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Campañas — MenuOS Admin' };

export default function CampaignsPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Campañas WhatsApp</h1>
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-rule py-20 text-center">
        <p className="text-sm font-sans text-muted">Campañas — Fase 1E</p>
      </div>
    </div>
  );
}
