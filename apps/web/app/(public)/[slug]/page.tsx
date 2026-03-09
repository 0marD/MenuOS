import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { CustomerMenuView } from './components/CustomerMenuView';
import { CustomerRegistrationSheet } from './components/CustomerRegistrationSheet';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  return {
    title: org ? `${org.name} — Menú` : 'Menú',
  };
}

export default async function PublicMenuPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, slug, logo_url, colors')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (!org) notFound();

  const { data: categories } = await supabase
    .from('menu_categories')
    .select(`
      id, name, icon, color, sort_order,
      menu_items (
        id, name, description, price, is_available, is_sold_out_today,
        menu_item_photos ( url, position ),
        menu_item_filters ( filter )
      )
    `)
    .eq('organization_id', org.id)
    .eq('is_visible', true)
    .is('deleted_at', null)
    .order('sort_order')
    .order('sort_order', { referencedTable: 'menu_items' });

  return (
    <>
      <CustomerMenuView org={org} categories={categories ?? []} />
      <CustomerRegistrationSheet orgId={org.id} orgName={org.name} />
    </>
  );
}
