'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';

// Initialize PostHog once on the client
if (typeof window !== 'undefined' && POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // No capturar datos PII por defecto
    autocapture: false,
    capture_pageview: false, // Lo hacemos manualmente para tener control
    capture_pageleave: true,
    persistence: 'localStorage',
    // Respetar Do Not Track del navegador
    respect_dnt: true,
    loaded: (ph) => {
      if (process.env.NODE_ENV !== 'production') {
        ph.opt_out_capturing(); // Silenciar en desarrollo
      }
    },
  });
}

/** Registra page views en cada cambio de ruta (App Router) */
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    posthog.capture('$pageview', {
      $current_url: window.location.href,
    });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!POSTHOG_KEY) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
