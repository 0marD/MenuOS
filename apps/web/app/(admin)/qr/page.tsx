import type { Metadata } from 'next';
import { QrCode } from 'lucide-react';
import { requireAdminSession } from '@/lib/auth/get-session';
import { QrGenerator } from './QrGenerator';

export const metadata: Metadata = { title: 'Código QR' };

export default async function QrPage() {
  const { org } = await requireAdminSession();

  const menuUrl = `https://menuos.mx/${org.slug}`;

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-8 flex items-center gap-3">
        <QrCode className="h-5 w-5 text-muted" />
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Código QR</h1>
          <p className="text-sm text-muted">
            Imprime o comparte el código QR para que tus clientes accedan al menú.
          </p>
        </div>
      </div>

      <QrGenerator slug={org.slug} orgName={org.name} menuUrl={menuUrl} />
    </div>
  );
}
