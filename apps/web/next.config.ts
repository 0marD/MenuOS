import type { NextConfig } from 'next';

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

export default config;
