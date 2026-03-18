'use client';

import { useState, useTransition } from 'react';
import { LayoutList } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import type { Tables } from '@menuos/database';
import { CreateCategoryDialog } from './CreateCategoryDialog';
import { SortableCategorySection } from './CategorySection';
import { reorderCategories } from '../actions';

type CategoryWithItems = Tables<'menu_categories'> & {
  menu_items: Tables<'menu_items'>[];
};

interface MenuEditorProps {
  categories: CategoryWithItems[];
}

export function MenuEditor({ categories: initialCategories }: MenuEditorProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const totalItems = categories.reduce((sum, cat) => sum + cat.menu_items.length, 0);
  const allCategories = categories.map((cat) => ({ id: cat.id, name: cat.name }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);

    setCategories(reordered);
    startTransition(async () => {
      await reorderCategories(reordered.map((c) => c.id));
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutList className="h-5 w-5 text-muted" />
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Menú</h1>
            <p className="text-sm text-muted">
              {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'} ·{' '}
              {totalItems} {totalItems === 1 ? 'platillo' : 'platillos'}
            </p>
          </div>
        </div>
        <CreateCategoryDialog />
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-rule py-16 text-center">
          <LayoutList className="h-10 w-10 text-muted" />
          <div>
            <p className="font-medium text-ink">Todavía no tienes categorías</p>
            <p className="mt-1 text-sm text-muted">
              Crea tu primera categoría para comenzar a armar tu menú.
            </p>
          </div>
          <CreateCategoryDialog />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext
            items={categories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-4">
              {categories.map((category) => (
                <SortableCategorySection
                  key={category.id}
                  category={category}
                  allCategories={allCategories}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
