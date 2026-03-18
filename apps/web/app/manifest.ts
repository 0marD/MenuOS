import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MenuOS',
    short_name: 'MenuOS',
    description: 'Sistema operativo para restaurantes independientes',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F0E8',
    theme_color: '#0F0E0C',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
