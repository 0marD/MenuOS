import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sin conexión — MenuOS' };

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <span className="mb-4 text-5xl" aria-hidden="true">📵</span>
      <h1 className="font-display text-2xl font-bold text-ink">Sin conexión</h1>
      <p className="mt-2 max-w-xs text-sm font-sans text-muted">
        No tienes conexión a internet. El menú que viste anteriormente puede estar desactualizado.
      </p>
      <p className="mt-1 text-xs font-mono text-muted">Los precios pueden no estar actualizados.</p>
    </main>
  );
}
