'use client';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper p-4 text-center">
      <div className="font-display text-5xl">📡</div>
      <h1 className="font-display text-2xl font-bold text-ink">Sin conexión</h1>
      <p className="max-w-sm text-sm text-muted">
        No hay conexión a internet. El menú que cargaste anteriormente está disponible.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 rounded bg-accent px-6 py-2 text-sm font-semibold text-white"
      >
        Reintentar
      </button>
    </div>
  );
}
