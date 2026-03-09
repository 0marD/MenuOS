import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LoyaltyManager } from './LoyaltyManager';

export const metadata: Metadata = { title: 'Fidelidad — MenuOS Admin' };

export default async function LoyaltyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('organization_id, role')
    .eq('auth_user_id', user.id)
    .single();
  if (!staffUser) redirect('/auth/login');

  const orgId = staffUser.organization_id;

  const { data: programs } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  // Analytics: stamp cards per program
  const programIds = (programs ?? []).map((p) => p.id);
  const { data: stampCards } = programIds.length > 0
    ? await supabase
        .from('stamp_cards')
        .select('program_id, is_complete')
        .in('program_id', programIds)
    : { data: [] };

  const analytics = programIds.reduce<Record<string, { total: number; completed: number }>>(
    (acc, id) => {
      const cards = (stampCards ?? []).filter((c) => c.program_id === id);
      acc[id] = {
        total: cards.length,
        completed: cards.filter((c) => c.is_complete).length,
      };
      return acc;
    },
    {}
  );

  const isAdmin = ['super_admin', 'manager'].includes(staffUser.role ?? '');

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Programa de Fidelidad</h1>
      <LoyaltyManager
        programs={programs ?? []}
        analytics={analytics}
        orgId={orgId}
        isAdmin={isAdmin}
      />
    </div>
  );
}
