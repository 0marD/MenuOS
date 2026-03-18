'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center bg-paper p-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl font-bold text-ink">Algo salió mal</h1>
          <p className="mt-2 text-sm text-muted">
            Ocurrió un error inesperado. El equipo ha sido notificado.
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded bg-accent px-6 py-2 text-sm font-semibold text-white hover:bg-accent/90"
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
