import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const config: NextConfig = {
  transpilePackages: ['@menuos/ui', '@menuos/shared', '@menuos/database'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@menuos/ui', 'lucide-react'],
  },
};

export default withSentryConfig(config, {
  org: process.env.SENTRY_ORG ?? '',
  project: process.env.SENTRY_PROJECT ?? '',
  authToken: process.env.SENTRY_AUTH_TOKEN ?? '',
  silent: true,
  tunnelRoute: '/monitoring-tunnel',
  sourcemaps: {
    disable: process.env.NODE_ENV !== 'production',
  },
});
