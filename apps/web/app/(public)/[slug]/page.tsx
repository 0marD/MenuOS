import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getMenuBySlug } from './actions';
import { CustomerMenuView } from './components/CustomerMenuView';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getMenuBySlug(slug);
  if (!data) return { title: 'Menú no encontrado' };
  return { title: `${data.org.name} — Menú` };
}

export default async function PublicMenuPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { table: qrToken } = await searchParams;

  const data = await getMenuBySlug(slug);
  if (!data) notFound();

  const { org, categories } = data;

  // Resolve table by QR token if present
  let tableId: string | null = null;
  let branchId: string | null = null;

  if (qrToken) {
    const supabase = await createClient();
    const { data: table } = await supabase
      .from('restaurant_tables')
      .select('id, branch_id')
      .eq('qr_token', qrToken)
      .eq('organization_id', org.id)
      .eq('is_active', true)
      .single();

    if (table) {
      tableId = table.id;
      branchId = table.branch_id;
    }
  }

  // Fall back to first active branch
  if (!branchId) {
    const supabase = await createClient();
    const { data: branch } = await supabase
      .from('branches')
      .select('id')
      .eq('organization_id', org.id)
      .eq('is_active', true)
      .order('created_at')
      .limit(1)
      .single();
    branchId = branch?.id ?? null;
  }

  if (!branchId) notFound();

  return (
    <CustomerMenuView
      org={{
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo_url: org.logo_url,
        banner_url: org.banner_url,
        colors: {
          primary_color: org.primary_color,
          secondary_color: org.secondary_color,
        },
      }}
      categories={categories}
      branchId={branchId}
      tableId={tableId}
    />
  );
}
