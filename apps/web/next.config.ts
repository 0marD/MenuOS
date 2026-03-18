import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@menuos/ui', '@menuos/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
      { protocol: 'https', hostname: 'pub-*.r2.dev' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

const sentryEnabled = !!process.env.SENTRY_AUTH_TOKEN;

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? '',
  project: process.env.SENTRY_PROJECT ?? '',
  silent: !process.env.CI,
  widenClientFileUpload: sentryEnabled,
  reactComponentAnnotation: { enabled: true },
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  automaticVercelMonitors: sentryEnabled,
  sourcemaps: {
    disable: !sentryEnabled,
  },
  telemetry: false,
});
