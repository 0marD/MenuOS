import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import { TableEditor } from './TableEditor';

export const metadata: Metadata = { title: 'Mesas' };

export default async function TablesPage() {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const [{ data: tables }, { data: branches }] = await Promise.all([
    supabase
      .from('restaurant_tables')
      .select('*')
      .eq('organization_id', org.id)
      .order('name'),
    supabase
      .from('branches')
      .select('id, name')
      .eq('organization_id', org.id)
      .eq('is_active', true),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://menuos.mx';

  return (
    <div className="p-4 lg:p-6">
      <Link
        href="/orders"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a pedidos
      </Link>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Gestión de mesas</h1>
      <TableEditor
        tables={tables ?? []}
        branches={branches ?? []}
        baseUrl={baseUrl}
        orgSlug={org.slug}
      />
    </div>
  );
}
