'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@menuos/ui';
import { MenuItemCard } from '@menuos/ui/molecules/MenuItemCard';
import { useMenuRealtime } from './useMenuRealtime';
import { MenuUpdateToast } from './MenuUpdateToast';
import { useCartStore } from '../cart/CartStore';
import { CartSheet } from '../cart/CartSheet';

interface MenuItemPhoto { url: string; position: number }
interface MenuItemFilter { filter: string }
interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  is_sold_out_today: boolean;
  menu_item_photos: MenuItemPhoto[];
  menu_item_filters: MenuItemFilter[];
}
interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
  menu_items: MenuItem[];
}
interface Org {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  colors: unknown;
}

interface CustomerMenuViewProps {
  org: Org;
  branchId: string;
  categories: Category[];
  tableToken?: string;
  tableNumber?: number;
}

export function CustomerMenuView({ org, branchId, categories, tableToken, tableNumber }: CustomerMenuViewProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [activeCategory, setActiveCategory] = useState<string | null>(
    categories[0]?.id ?? null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUpdate, setHasUpdate] = useState(false);
  const { addItem } = useCartStore();

  const handleMenuUpdate = useCallback(() => {
    setHasUpdate(true);
  }, []);

  const handleRefresh = useCallback(() => {
    setHasUpdate(false);
    startTransition(() => router.refresh());
  }, [router]);

  useMenuRealtime(org.id, handleMenuUpdate);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        menu_items: cat.menu_items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.menu_items.length > 0);
  }, [categories, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex h-14 items-center gap-3">
            {org.logo_url && (
              <img
                src={org.logo_url}
                alt={`${org.name} logo`}
                className="h-8 w-8 rounded-full object-contain"
              />
            )}
            <h1 className="font-display text-lg font-bold text-ink">{org.name}</h1>
          </div>

          {/* Search */}
          <div className="relative pb-3">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Buscar en el menú..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-full border border-rule bg-cream pl-9 pr-9 text-sm font-sans placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Buscar platillos"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Category Nav */}
          {!isSearching && (
            <nav
              aria-label="Categorías del menú"
              className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-3"
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-sans font-medium transition-colors',
                    activeCategory === cat.id
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-rule bg-cream text-foreground hover:bg-paper'
                  )}
                  aria-current={activeCategory === cat.id ? 'true' : undefined}
                >
                  {cat.icon && <span aria-hidden="true">{cat.icon}</span>}
                  {cat.name}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Menu Content */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-20">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-sans text-muted">Sin resultados para &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <section
              key={category.id}
              id={`cat-${category.id}`}
              aria-labelledby={`cat-title-${category.id}`}
              className="pt-6"
            >
              <h2
                id={`cat-title-${category.id}`}
                className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-ink"
              >
                {category.icon && <span aria-hidden="true">{category.icon}</span>}
                {category.name}
              </h2>
              <div className="flex flex-col gap-2">
                {category.menu_items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    name={item.name}
                    {...(item.description !== null ? { description: item.description } : {})}
                    price={Number(item.price)}
                    {...(item.menu_item_photos[0]?.url ? { imageUrl: item.menu_item_photos[0].url } : {})}
                    isSoldOut={item.is_sold_out_today}
                    filters={item.menu_item_filters.map((f) => f.filter)}
                    {...(!item.is_sold_out_today ? { onSelect: () => addItem({ id: item.id, name: item.name, price: Number(item.price) }) } : {})}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <MenuUpdateToast visible={hasUpdate} onRefresh={handleRefresh} />
      <CartSheet
        slug={org.slug}
        orgId={org.id}
        branchId={branchId}
        {...(tableToken !== undefined ? { tableToken } : {})}
        {...(tableNumber !== undefined ? { tableNumber } : {})}
      />
    </div>
  );
}
