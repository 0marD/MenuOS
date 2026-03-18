'use client';

import { Search, ShoppingCart, User } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { MenuItemCard } from '@menuos/ui';
import { formatMXN } from '@menuos/shared';
import { CustomerLayout } from '@menuos/ui';
import type { Tables } from '@menuos/database';
import { useCartStore } from '../cart/CartStore';
import { CartSheet } from '../cart/CartSheet';
import { CustomerRegistrationSheet } from './CustomerRegistrationSheet';
import { MenuUpdateToast } from './MenuUpdateToast';
import { useMenuRealtime } from './useMenuRealtime';

type Category = Tables<'menu_categories'> & { menu_items: Tables<'menu_items'>[] };

export interface OrgColors {
  primary_color: string | null;
  secondary_color: string | null;
}

interface Org {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  colors: OrgColors;
}

interface CustomerMenuViewProps {
  org: Org;
  categories: Category[];
  branchId: string;
  tableId: string | null;
}

type DietaryFilter = 'vegetarian' | 'gluten_free' | 'spicy';

const DIETARY_FILTERS: { key: DietaryFilter; label: string; emoji: string }[] = [
  { key: 'vegetarian', label: 'Vegetariano', emoji: '🥦' },
  { key: 'gluten_free', label: 'Sin gluten', emoji: '🌾' },
  { key: 'spicy', label: 'Picante', emoji: '🌶️' },
];

export function CustomerMenuView({ org, categories, branchId, tableId }: CustomerMenuViewProps) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(categories[0]?.id ?? null);
  const [activeFilters, setActiveFilters] = useState<Set<DietaryFilter>>(new Set());
  const [showCart, setShowCart] = useState(false);
  const [showReg, setShowReg] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [menuUpdated, setMenuUpdated] = useState(false);

  function toggleFilter(filter: DietaryFilter) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  }

  const { items, addItem, setContext, total } = useCartStore();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = total();

  useEffect(() => {
    setContext(org.slug, tableId);
  }, [org.slug, tableId, setContext]);

  const handleMenuUpdate = useCallback(() => setMenuUpdated(true), []);
  useMenuRealtime(org.id, handleMenuUpdate);

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      menu_items: cat.menu_items.filter((item) => {
        if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (activeFilters.has('vegetarian') && !item.is_vegetarian) return false;
        if (activeFilters.has('gluten_free') && !item.is_gluten_free) return false;
        if (activeFilters.has('spicy') && !item.is_spicy) return false;
        return true;
      }),
    }))
    .filter((cat) => cat.menu_items.length > 0);

  const visibleCategories = filteredCategories.filter(
    (cat) => cat.is_visible && cat.menu_items.length > 0,
  );

  return (
    <CustomerLayout
      {...(org.colors.primary_color ? { primaryColor: org.colors.primary_color } : {})}
      header={
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {org.logo_url && (
                <div className="relative h-8 w-8 overflow-hidden rounded">
                  <Image src={org.logo_url} alt={org.name} fill className="object-contain" unoptimized />
                </div>
              )}
              <span className="font-display text-base font-semibold text-ink">{org.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReg(true)}
                className="rounded-full p-2 text-muted hover:bg-cream hover:text-ink"
                aria-label="Mi perfil"
              >
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Buscar platillos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-rule bg-cream py-2 pl-9 pr-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Category tabs */}
          {!search && (
            <div className="scrollbar-hide -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCat(cat.id);
                    document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeCat === cat.id
                      ? 'bg-accent text-white'
                      : 'bg-cream text-muted hover:bg-rule hover:text-ink'
                  }`}
                  style={activeCat === cat.id ? { backgroundColor: org.colors.primary_color ?? undefined } : undefined}
                >
                  {cat.icon && <span className="mr-1">{cat.icon}</span>}
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Dietary filters */}
          <div className="scrollbar-hide -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
            {DIETARY_FILTERS.map(({ key, label, emoji }) => {
              const active = activeFilters.has(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  className={`shrink-0 flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-rule bg-paper text-muted hover:border-accent/50'
                  }`}
                  aria-pressed={active}
                  aria-label={`Filtrar por ${label}`}
                >
                  <span aria-hidden>{emoji}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      }
    >
      {/* Banner */}
      {org.banner_url && !search && (
        <div className="relative h-40 w-full">
          <Image src={org.banner_url} alt={`${org.name} banner`} fill className="object-cover" unoptimized />
        </div>
      )}

      {/* Menu */}
      <div className="px-4 pb-32">
        {visibleCategories.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">No se encontraron platillos.</p>
        ) : (
          visibleCategories.map((cat) => (
            <section key={cat.id} id={`cat-${cat.id}`} className="mb-8 scroll-mt-44">
              <h2 className="mb-3 font-display text-lg font-bold text-ink">
                {cat.icon && <span className="mr-2">{cat.icon}</span>}
                {cat.name}
              </h2>
              <div className="flex flex-col gap-3">
                {cat.menu_items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    name={item.name}
                    description={item.description}
                    price={formatMXN(item.base_price)}
                    photoUrl={item.photo_url}
                    isAvailable={item.is_available}
                    isSoldOut={item.is_sold_out_today}
                    isSpecial={item.is_special}
                    isVegetarian={item.is_vegetarian}
                    isGlutenFree={item.is_gluten_free}
                    isSpicy={item.is_spicy}
                    preparationTime={item.preparation_time_minutes}
                    {...(item.is_available && !item.is_sold_out_today
                      ? { onClick: () => addItem({ id: item.id, name: item.name, price: item.base_price }) }
                      : {})}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Cart FAB */}
      {cartCount > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full px-6 py-3 shadow-xl"
          style={{ backgroundColor: org.colors.primary_color ?? '#D4500A', color: '#fff' }}
          aria-label={`Ver carrito — ${cartCount} artículos`}
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="font-medium">{cartCount} artículo{cartCount !== 1 ? 's' : ''}</span>
          <span className="font-display font-bold">{formatMXN(cartTotal)}</span>
        </button>
      )}

      {/* Order confirmed */}
      {orderId && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-rule bg-paper px-6 py-4 shadow-xl text-center"
        >
          <p className="font-display text-lg font-bold text-ink">¡Pedido enviado!</p>
          <p className="mt-1 text-sm text-muted">El restaurante ya está preparando tu orden.</p>
          <button
            onClick={() => setOrderId(null)}
            className="mt-3 text-xs text-accent underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {showCart && (
        <CartSheet
          orgId={org.id}
          branchId={branchId}
          customerId={customerId}
          onClose={() => setShowCart(false)}
          onOrderPlaced={(id) => { setShowCart(false); setOrderId(id); }}
          onNeedsRegistration={() => { setShowCart(false); setShowReg(true); }}
        />
      )}

      {showReg && (
        <CustomerRegistrationSheet
          orgId={org.id}
          orgName={org.name}
          onSuccess={(id) => { setCustomerId(id); setShowReg(false); }}
          onClose={() => setShowReg(false)}
        />
      )}

      <MenuUpdateToast show={menuUpdated} onDismiss={() => setMenuUpdated(false)} />
    </CustomerLayout>
  );
}
