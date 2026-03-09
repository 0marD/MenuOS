import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CampaignBuilder } from './CampaignBuilder';

export const metadata: Metadata = { title: 'Nueva campaña — MenuOS Admin' };

export default async function NewCampaignPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('organization_id')
    .eq('auth_user_id', user.id)
    .single();
  if (!staffUser) redirect('/auth/login');

  // Count customers per segment
  const { data: segmentCounts } = await supabase
    .from('customers')
    .select('segment')
    .eq('organization_id', staffUser.organization_id)
    .eq('is_opted_in', true)
    .is('deleted_at', null);

  const counts = {
    all: segmentCounts?.length ?? 0,
    new: segmentCounts?.filter((c) => c.segment === 'new').length ?? 0,
    frequent: segmentCounts?.filter((c) => c.segment === 'frequent').length ?? 0,
    dormant: segmentCounts?.filter((c) => c.segment === 'dormant').length ?? 0,
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Nueva campaña</h1>
        <p className="mt-1 text-sm font-sans text-muted">
          Crea un mensaje para enviar por WhatsApp a tus clientes.
        </p>
      </div>
      <CampaignBuilder orgId={staffUser.organization_id} segmentCounts={counts} />
    </div>
  );
}
