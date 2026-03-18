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
  // Linting is handled by a dedicated `pnpm lint` step; skip the duplicate check during build
  eslint: { ignoreDuringBuilds: true },
};

// Only enable Sentry build integration (source maps + releases) in CI where the token
// has the required `project:releases` scope. Locally, the DSN-based runtime error
// reporting still works via instrumentation.ts — no token needed for that.
const sentryBuildEnabled = !!process.env.SENTRY_AUTH_TOKEN && !!process.env.CI;

if (!sentryBuildEnabled) {
  module.exports = nextConfig;
} else {
  module.exports = withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG ?? '',
    project: process.env.SENTRY_PROJECT ?? '',
    silent: !process.env.CI,
    widenClientFileUpload: true,
    reactComponentAnnotation: { enabled: true },
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    automaticVercelMonitors: true,
    sourcemaps: { disable: false },
    telemetry: false,
  });
}
