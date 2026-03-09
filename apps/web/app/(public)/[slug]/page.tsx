import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { CustomerMenuView } from './components/CustomerMenuView';
import { CustomerRegistrationSheet } from './components/CustomerRegistrationSheet';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string }>;
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

export default async function PublicMenuPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { table: tableToken } = await searchParams;

  const supabase = await createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, slug, logo_url, colors')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (!org) notFound();

  // Get first active branch for this org (multi-branch: resolve by table token)
  const { data: branch } = await supabase
    .from('branches')
    .select('id')
    .eq('organization_id', org.id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  // Resolve table info if QR token provided
  let tableNumber: number | undefined;
  if (tableToken) {
    const { data: table } = await supabase
      .from('restaurant_tables')
      .select('number')
      .eq('qr_token', tableToken)
      .eq('is_active', true)
      .single();
    if (table) tableNumber = table.number;
  }

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
      <CustomerMenuView
        org={org}
        branchId={branch?.id ?? ''}
        categories={categories ?? []}
        {...(tableToken !== undefined ? { tableToken } : {})}
        {...(tableNumber !== undefined ? { tableNumber } : {})}
      />
      <CustomerRegistrationSheet orgId={org.id} orgName={org.name} />
    </>
  );
}
