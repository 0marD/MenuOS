import type { Metadata } from 'next';
import { MessageSquare } from 'lucide-react';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import { CampaignList } from './CampaignList';

export const metadata: Metadata = { title: 'Campañas' };

export default async function CampaignsPage() {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, campaign_analytics(*)')
    .eq('organization_id', org.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center gap-3">
        <MessageSquare className="h-5 w-5 text-muted" />
        <h1 className="font-display text-2xl font-bold text-ink">Campañas WhatsApp</h1>
      </div>
      <CampaignList campaigns={campaigns ?? []} />
    </div>
  );
}
