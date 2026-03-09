import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { DashboardMetrics } from './components/DashboardMetrics';

export const metadata: Metadata = {
  title: 'Dashboard — MenuOS Admin',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [categoriesResult, itemsResult] = await Promise.all([
    supabase
      .from('menu_categories')
      .select('id', { count: 'exact' })
      .is('deleted_at', null),
    supabase
      .from('menu_items')
      .select('id', { count: 'exact' })
      .is('deleted_at', null)
      .eq('is_available', true),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Dashboard</h1>
      <DashboardMetrics
        categoryCount={categoriesResult.count ?? 0}
        itemCount={itemsResult.count ?? 0}
      />
    </div>
  );
}
