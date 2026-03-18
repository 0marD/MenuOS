import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from './OnboardingWizard';

export default async function OnboardingPage() {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const [
    { data: orgData },
    { count: menuItems },
    { count: branches },
    { count: staff },
  ] = await Promise.all([
    supabase
      .from('organizations')
      .select('name, logo_url, primary_color')
      .eq('id', org.id)
      .single(),
    supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', org.id)
      .is('deleted_at', null),
    supabase
      .from('branches')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', org.id),
    supabase
      .from('staff_users')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', org.id),
  ]);

  const completedSteps: string[] = [];
  if (orgData?.logo_url && orgData.primary_color) completedSteps.push('brand');
  if ((menuItems ?? 0) > 0) completedSteps.push('menu');
  if ((branches ?? 0) > 0) completedSteps.push('branch');
  // QR is always downloadable
  completedSteps.push('qr');
  if ((staff ?? 0) > 1) completedSteps.push('team');

  return <OnboardingWizard completedSteps={completedSteps} />;
}
