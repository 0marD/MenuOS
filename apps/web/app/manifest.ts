import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MenuOS',
    short_name: 'MenuOS',
    description: 'El menú digital de tu restaurante favorito',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F0E8',
    theme_color: '#0F0E0C',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['food', 'lifestyle'],
  };
}
