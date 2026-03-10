import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Porcentaje de transacciones a capturar para performance (0.0 – 1.0)
  // En producción usa 0.1 (10%) para no gastar cuota
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Porcentaje de sesiones de replay a capturar
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      // No capturar datos sensibles en replays
      maskAllText: true,
      blockAllMedia: false,
    }),
  ],

  // No enviar errores en desarrollo local
  enabled: process.env.NODE_ENV === 'production',

  environment: process.env.NODE_ENV,
});
