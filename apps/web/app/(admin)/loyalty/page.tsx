import type { Metadata } from 'next';
import { Star } from 'lucide-react';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import { LoyaltyManager } from './LoyaltyManager';

export const metadata: Metadata = { title: 'Fidelización' };

export default async function LoyaltyPage() {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const [
    { data: programs },
    { count: totalCards },
    { count: totalStamps },
  ] = await Promise.all([
    supabase
      .from('loyalty_programs')
      .select('*')
      .eq('organization_id', org.id)
      .order('created_at'),
    supabase
      .from('stamp_cards')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', org.id),
    supabase
      .from('stamps')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', org.id),
  ]);

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center gap-3">
        <Star className="h-5 w-5 text-muted" />
        <h1 className="font-display text-2xl font-bold text-ink">Fidelización</h1>
      </div>
      <LoyaltyManager
        programs={programs ?? []}
        totalCards={totalCards ?? 0}
        totalStamps={totalStamps ?? 0}
      />
    </div>
  );
}
