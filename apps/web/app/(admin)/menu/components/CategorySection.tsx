'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@menuos/ui/atoms/Button';
import { Badge } from '@menuos/ui/atoms/Badge';
import { Toggle } from '@menuos/ui/atoms/Toggle';
import { cn } from '@menuos/ui';
import { MenuItemRow } from './MenuItemRow';
import { CreateItemDialog } from './CreateItemDialog';
import { EditCategoryDialog } from './EditCategoryDialog';
import { toggleCategoryVisibility, deleteCategory } from '../actions';
import type { Tables } from '@menuos/database/types';

type MenuItemWithRelations = Tables<'menu_items'> & {
  menu_item_photos: Array<{ url: string; position: number }>;
  menu_item_filters: Array<{ filter: string }>;
};

type CategoryWithItems = Tables<'menu_categories'> & {
  menu_items: MenuItemWithRelations[];
};

interface CategorySectionProps {
  category: CategoryWithItems;
  onUpdated: (category: Tables<'menu_categories'>) => void;
  onDeleted: (id: string) => void;
}

export function CategorySection({ category, onUpdated, onDeleted }: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [items, setItems] = useState(category.menu_items);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isVisible, setIsVisible] = useState(category.is_visible);

  async function handleToggleVisibility() {
    const newValue = !isVisible;
    setIsVisible(newValue);
    await toggleCategoryVisibility(category.id, newValue);
    onUpdated({ ...category, is_visible: newValue });
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar la categoría "${category.name}"? Los platillos también serán eliminados.`)) return;
    await deleteCategory(category.id);
    onDeleted(category.id);
  }

  function handleItemCreated(item: Tables<'menu_items'>) {
    setItems((prev) => [
      ...prev,
      { ...item, menu_item_photos: [], menu_item_filters: [] },
    ]);
    setIsCreatingItem(false);
  }

  function handleItemUpdated(updated: Tables<'menu_items'>) {
    setItems((prev) =>
      prev.map((it) => (it.id === updated.id ? { ...it, ...updated } : it))
    );
  }

  function handleItemDeleted(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  return (
    <section
      className="overflow-hidden rounded-xl border border-rule bg-card"
      aria-labelledby={`category-${category.id}`}
    >
      <div className="flex items-center gap-2 p-4">
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left"
          aria-expanded={isExpanded}
          aria-controls={`category-items-${category.id}`}
        >
          {category.icon && (
            <span className="text-lg" aria-hidden="true">{category.icon}</span>
          )}
          <h2
            id={`category-${category.id}`}
            className="font-display text-base font-semibold text-ink"
          >
            {category.name}
          </h2>
          <Badge variant="outline" className="ml-1 text-[10px]">
            {items.length}
          </Badge>
          {isExpanded ? (
            <ChevronUp className="ml-auto h-4 w-4 text-muted" aria-hidden="true" />
          ) : (
            <ChevronDown className="ml-auto h-4 w-4 text-muted" aria-hidden="true" />
          )}
        </button>
        <Toggle
          pressed={isVisible}
          onPressedChange={handleToggleVisibility}
          aria-label={isVisible ? 'Ocultar categoría' : 'Mostrar categoría'}
          size="sm"
          variant="outline"
        >
          {isVisible ? (
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </Toggle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Editar categoría"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          aria-label="Eliminar categoría"
          onClick={handleDelete}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>

      <div
        id={`category-items-${category.id}`}
        className={cn('border-t border-rule', !isExpanded && 'hidden')}
      >
        {items.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs font-sans text-muted">
            Esta categoría no tiene platillos
          </p>
        ) : (
          <ul role="list" className="divide-y divide-rule">
            {items.map((item) => (
              <li key={item.id}>
                <MenuItemRow
                  item={item}
                  onUpdated={handleItemUpdated}
                  onDeleted={handleItemDeleted}
                />
              </li>
            ))}
          </ul>
        )}
        <div className="p-3 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => setIsCreatingItem(true)}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Agregar platillo
          </Button>
        </div>
      </div>

      {isCreatingItem && (
        <CreateItemDialog
          categoryId={category.id}
          onCreated={handleItemCreated}
          onClose={() => setIsCreatingItem(false)}
        />
      )}
      {isEditing && (
        <EditCategoryDialog
          category={category}
          onUpdated={(updated) => {
            onUpdated(updated);
            setIsEditing(false);
          }}
          onClose={() => setIsEditing(false)}
        />
      )}
    </section>
  );
}
