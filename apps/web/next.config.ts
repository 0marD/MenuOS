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

export default nextConfig;
