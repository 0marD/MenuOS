import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Código QR — MenuOS Admin' };

export default function QrPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Código QR</h1>
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-rule py-20 text-center">
        <p className="text-sm font-sans text-muted">Generador de QR — Fase 1B</p>
      </div>
    </div>
  );
}
