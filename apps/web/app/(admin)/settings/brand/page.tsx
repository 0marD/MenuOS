import type { Metadata } from 'next';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import { BrandSettingsForm } from './BrandSettingsForm';

export const metadata: Metadata = { title: 'Marca' };

export default async function BrandSettingsPage() {
  const { org: sessionOrg } = await requireAdminSession();
  const supabase = await createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('name, slug, logo_url, banner_url, primary_color, secondary_color')
    .eq('id', sessionOrg.id)
    .single();

  if (!org) return null;

  return <BrandSettingsForm org={org} />;
}
