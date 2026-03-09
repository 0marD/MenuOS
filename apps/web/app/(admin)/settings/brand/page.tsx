import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { BrandSettingsForm } from './BrandSettingsForm';

export const metadata: Metadata = { title: 'Marca — Configuración' };

export default async function BrandPage() {
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
    .select('id, name, slug, logo_url, banner_url, colors')
    .eq('id', staffUser.organization_id)
    .single();

  const { data: templates } = await supabase
    .from('design_templates')
    .select('id, name, slug, preview_url');

  const { data: currentTemplate } = await supabase
    .from('org_settings')
    .select('value')
    .eq('organization_id', staffUser.organization_id)
    .eq('key', 'design_template')
    .single();

  return (
    <BrandSettingsForm
      org={org ?? { id: '', name: '', slug: '', logo_url: null, banner_url: null, colors: null }}
      templates={templates ?? []}
      currentTemplateSlug={currentTemplate?.value ?? 'classic'}
    />
  );
}
