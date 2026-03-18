import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { requireAdminSession } from '@/lib/auth/get-session';
import { CampaignBuilder } from './CampaignBuilder';

export const metadata: Metadata = { title: 'Nueva campaña' };

export default async function NewCampaignPage() {
  await requireAdminSession();
  return (
    <div className="p-4 lg:p-6">
      <Link
        href="/campaigns"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a campañas
      </Link>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Nueva campaña</h1>
      <CampaignBuilder />
    </div>
  );
}
