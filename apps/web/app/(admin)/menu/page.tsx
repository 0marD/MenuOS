import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { MenuEditor } from './components/MenuEditor';

export const metadata: Metadata = {
  title: 'Menú — MenuOS Admin',
};

export default async function MenuPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('menu_categories')
    .select(`
      *,
      menu_items (
        *,
        menu_item_photos ( url, position ),
        menu_item_filters ( filter )
      )
    `)
    .is('deleted_at', null)
    .order('sort_order')
    .order('sort_order', { referencedTable: 'menu_items' });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Menú</h1>
      </div>
      <MenuEditor categories={categories ?? []} />
    </div>
  );
}
