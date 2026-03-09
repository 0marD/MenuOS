import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OnboardingWizard } from './OnboardingWizard';

export const metadata: Metadata = { title: 'Configuración inicial — MenuOS' };

export default async function OnboardingPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('organization_id, name')
    .eq('auth_user_id', user.id)
    .single();
  if (!staffUser) redirect('/auth/login');

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, slug, logo_url')
    .eq('id', staffUser.organization_id)
    .single();
  if (!org) redirect('/auth/login');

  const { data: branches } = await supabase
    .from('branches')
    .select('id')
    .eq('organization_id', staffUser.organization_id)
    .is('deleted_at', null)
    .limit(1);

  const { data: categories } = await supabase
    .from('menu_categories')
    .select('id')
    .eq('organization_id', staffUser.organization_id)
    .is('deleted_at', null)
    .limit(1);

  const progress = {
    hasBranch: (branches?.length ?? 0) > 0,
    hasMenu: (categories?.length ?? 0) > 0,
    hasLogo: !!org.logo_url,
  };

  return (
    <OnboardingWizard
      org={org}
      staffName={staffUser.name}
      progress={progress}
    />
  );
}
