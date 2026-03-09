import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { QrGenerator } from './QrGenerator';

export const metadata: Metadata = { title: 'Código QR — MenuOS Admin' };

export default async function QrPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('organization_id')
    .eq('auth_user_id', user.id)
    .single();
  if (!staffUser) return null;

  const { data: org } = await supabase
    .from('organizations')
    .select('name, slug')
    .eq('id', staffUser.organization_id)
    .single();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Código QR</h1>
      {org && <QrGenerator orgName={org.name} slug={org.slug} />}
    </div>
  );
}
