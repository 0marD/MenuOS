import type { Metadata, Viewport } from 'next';
import { PostHogProvider } from '@/components/PostHogProvider';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';
import './globals.css';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://menuos.mx';

export const metadata: Metadata = {
  title: {
    default: 'MenuOS',
    template: '%s | MenuOS',
  },
  description: 'Sistema operativo para restaurantes independientes',
  metadataBase: new URL(appUrl),
  openGraph: {
    type: 'website',
    siteName: 'MenuOS',
    title: 'MenuOS — Sistema operativo para restaurantes',
    description: 'Gestiona tu menú, pedidos, clientes y campañas desde un solo lugar.',
    url: appUrl,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MenuOS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MenuOS — Sistema operativo para restaurantes',
    description: 'Gestiona tu menú, pedidos, clientes y campañas desde un solo lugar.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0F0E0C',
  width: 'device-width',
  initialScale: 1,
  // maximumScale removed — WCAG 1.4.4: users must be able to resize text up to 200%
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
