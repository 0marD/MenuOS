import type { Metadata, Viewport } from 'next';
import { PostHogProvider } from '@/components/PostHogProvider';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'MenuOS',
    template: '%s | MenuOS',
  },
  description: 'Sistema operativo para restaurantes independientes',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://menuos.mx'),
};

export const viewport: Viewport = {
  themeColor: '#0F0E0C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
