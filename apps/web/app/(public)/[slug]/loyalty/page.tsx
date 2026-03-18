import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { StampCardView } from './StampCardView';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cid?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Fidelización — ${slug}` };
}

export default async function LoyaltyPwaPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { cid: customerId } = await searchParams;

  if (!customerId) notFound();

  const supabase = await createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('slug', slug)
    .single();

  if (!org) notFound();

  const [{ data: program }, { data: customer }] = await Promise.all([
    supabase
      .from('loyalty_programs')
      .select('*')
      .eq('organization_id', org.id)
      .eq('is_active', true)
      .single(),
    supabase
      .from('customers')
      .select('id, name')
      .eq('id', customerId)
      .eq('organization_id', org.id)
      .single(),
  ]);

  if (!program || !customer) notFound();

  const [{ data: card }, { data: rewards }] = await Promise.all([
    supabase
      .from('stamp_cards')
      .select('*')
      .eq('program_id', program.id)
      .eq('customer_id', customer.id)
      .single(),
    supabase
      .from('rewards')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('organization_id', org.id)
      .eq('is_redeemed', false),
  ]);

  return (
    <div className="min-h-screen bg-paper">
      <StampCardView
        program={program}
        card={card ?? null}
        pendingRewards={rewards ?? []}
        customerName={customer.name}
      />
    </div>
  );
}
