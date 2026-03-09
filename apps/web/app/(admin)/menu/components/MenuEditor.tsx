'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@menuos/ui/atoms/Button';
import { CategorySection } from './CategorySection';
import { CreateCategoryDialog } from './CreateCategoryDialog';
import type { Tables } from '@menuos/database/types';

type MenuItemWithRelations = Tables<'menu_items'> & {
  menu_item_photos: Array<{ url: string; position: number }>;
  menu_item_filters: Array<{ filter: string }>;
};

type CategoryWithItems = Tables<'menu_categories'> & {
  menu_items: MenuItemWithRelations[];
};

interface MenuEditorProps {
  categories: CategoryWithItems[];
}

export function MenuEditor({ categories: initialCategories }: MenuEditorProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  function handleCategoryCreated(category: Tables<'menu_categories'>) {
    setCategories((prev) => [
      ...prev,
      { ...category, menu_items: [] },
    ]);
    setIsCreatingCategory(false);
  }

  function handleCategoryUpdated(updated: Tables<'menu_categories'>) {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === updated.id ? { ...cat, ...updated } : cat
      )
    );
  }

  function handleCategoryDeleted(id: string) {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-rule py-16 text-center">
        <p className="text-sm font-sans text-muted">Tu menú está vacío</p>
        <p className="mt-1 text-xs font-sans text-muted">Empieza creando una categoría</p>
        <Button
          className="mt-4"
          onClick={() => setIsCreatingCategory(true)}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nueva categoría
        </Button>
        {isCreatingCategory && (
          <CreateCategoryDialog
            onCreated={handleCategoryCreated}
            onClose={() => setIsCreatingCategory(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <CategorySection
          key={category.id}
          category={category}
          onUpdated={handleCategoryUpdated}
          onDeleted={handleCategoryDeleted}
        />
      ))}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setIsCreatingCategory(true)}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Nueva categoría
      </Button>
      {isCreatingCategory && (
        <CreateCategoryDialog
          onCreated={handleCategoryCreated}
          onClose={() => setIsCreatingCategory(false)}
        />
      )}
    </div>
  );
}
