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
      <body className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <p className="text-4xl mb-4" aria-hidden="true">⚠️</p>
        <h1 className="text-xl font-bold text-gray-900">Algo salió mal</h1>
        <p className="mt-2 text-sm text-gray-500">
          El equipo fue notificado. Por favor intenta de nuevo.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
