import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pedidos — MenuOS Admin' };

export default function OrdersPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Pedidos</h1>
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-rule py-20 text-center">
        <p className="text-sm font-sans text-muted">Módulo de pedidos — Fase 2</p>
      </div>
    </div>
  );
}
