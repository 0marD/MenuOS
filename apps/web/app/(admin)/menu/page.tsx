import type { Metadata } from 'next';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import { MenuEditor } from './components/MenuEditor';

export const metadata: Metadata = { title: 'Menú' };

export default async function MenuPage() {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*, menu_items(*)')
    .eq('organization_id', org.id)
    .is('deleted_at', null)
    .order('sort_order');

  const normalizedCategories = (categories ?? []).map((cat) => ({
    ...cat,
    menu_items: (cat.menu_items ?? [])
      .filter((item) => item.deleted_at === null)
      .sort((a, b) => a.sort_order - b.sort_order),
  }));

  return (
    <div className="p-4 lg:p-6">
      <MenuEditor categories={normalizedCategories} />
    </div>
  );
}
