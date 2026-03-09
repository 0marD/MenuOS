import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { StampCardView } from './StampCardView';

export const metadata: Metadata = { title: 'Mi tarjeta — MenuOS' };

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cid?: string }>;
}

export default async function LoyaltyPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { cid: customerId } = await searchParams;

  const supabase = await createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, logo_url')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (!org) notFound();

  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('id, name, stamps_required, reward_type, reward_value')
    .eq('organization_id', org.id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('created_at')
    .limit(1)
    .single();

  let stampCard = null;
  let reward = null;

  if (program && customerId) {
    const { data: card } = await supabase
      .from('stamp_cards')
      .select('id, stamp_count, is_complete, completed_at')
      .eq('program_id', program.id)
      .eq('customer_id', customerId)
      .single();

    stampCard = card;

    if (card?.is_complete) {
      const { data: r } = await supabase
        .from('rewards')
        .select('id, code, redeemed_at, expires_at')
        .eq('stamp_card_id', card.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      reward = r;
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-paper">
      <header className="flex h-14 items-center gap-3 border-b border-rule px-4">
        {org.logo_url && (
          <img src={org.logo_url} alt="" className="h-8 w-8 rounded-full object-contain" />
        )}
        <span className="font-display text-lg font-bold text-ink">{org.name}</span>
      </header>

      <div className="mx-auto w-full max-w-sm px-4 py-8">
        {!program ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3" aria-hidden="true">🎁</p>
            <p className="font-display text-xl font-bold text-ink">Sin programa activo</p>
            <p className="mt-1 text-sm font-sans text-muted">
              {org.name} no tiene un programa de fidelidad activo en este momento.
            </p>
          </div>
        ) : (
          <StampCardView
            program={program}
            stampCard={stampCard}
            reward={reward}
            orgName={org.name}
          />
        )}
      </div>
    </main>
  );
}
