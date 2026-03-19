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

// Enable Sentry build integration only when all three required vars are present.
// If any is missing or empty the build skips upload entirely — runtime error
// reporting via DSN still works without a token.
const sentryBuildEnabled =
  !!process.env.SENTRY_AUTH_TOKEN &&
  !!process.env.SENTRY_ORG &&
  !!process.env.SENTRY_PROJECT;

if (!sentryBuildEnabled) {
  module.exports = nextConfig;
} else {
  module.exports = withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
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
