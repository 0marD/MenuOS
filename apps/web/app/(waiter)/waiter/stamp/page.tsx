import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StampGrantForm } from './StampGrantForm';

export const metadata: Metadata = { title: 'Otorgar sello — Mesero' };

export default async function StampPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/pin');

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('id, organization_id, branch_id')
    .eq('auth_user_id', user.id)
    .single();
  if (!staffUser) redirect('/auth/pin');

  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('id, name, stamps_required, reward_type, reward_value')
    .eq('organization_id', staffUser.organization_id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('created_at')
    .limit(1)
    .single();

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold text-paper">Otorgar sello</h1>
        <p className="text-sm text-white/50">Busca al cliente por teléfono y otorga su sello</p>
      </div>

      {!program ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-white/50">No hay programa de fidelidad activo</p>
        </div>
      ) : (
        <StampGrantForm
          program={program}
          staffId={staffUser.id}
          branchId={staffUser.branch_id}
          orgId={staffUser.organization_id}
        />
      )}
    </div>
  );
}
