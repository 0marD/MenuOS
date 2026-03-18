'use client';

import { ChevronDown, ChevronRight, Eye, EyeOff, GripVertical, Trash2 } from 'lucide-react';
import { useOptimistic, useState, useTransition } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@menuos/ui';
import type { Tables } from '@menuos/database';
import { deleteCategory, reorderMenuItems, toggleCategoryVisibility } from '../actions';
import { EditCategoryDialog } from './EditCategoryDialog';
import { CreateItemDialog } from './CreateItemDialog';
import { MenuItemRow } from './MenuItemRow';

type CategoryWithItems = Tables<'menu_categories'> & {
  menu_items: Tables<'menu_items'>[];
};

interface CategorySectionProps {
  category: CategoryWithItems;
  allCategories: Pick<Tables<'menu_categories'>, 'id' | 'name'>[];
}

export function SortableCategorySection({ category, allCategories }: CategorySectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CategorySection
        category={category}
        allCategories={allCategories}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

interface CategorySectionInnerProps extends CategorySectionProps {
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

function CategorySection({ category, allCategories, dragHandleProps }: CategorySectionInnerProps) {
  const [items, setItems] = useState(category.menu_items);
  const [expanded, setExpanded] = useState(true);
  const [, startTransition] = useTransition();
  const [optimisticVisible, setOptimisticVisible] = useOptimistic(category.is_visible);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleToggleVisibility() {
    startTransition(async () => {
      setOptimisticVisible(!optimisticVisible);
      await toggleCategoryVisibility(category.id, !optimisticVisible);
    });
  }

  function handleDelete() {
    if (
      !confirm(
        `¿Eliminar la categoría "${category.name}"? Los platillos dentro también serán eliminados.`,
      )
    )
      return;
    startTransition(async () => { await deleteCategory(category.id); });
  }

  function handleItemDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);

    setItems(reordered);
    startTransition(async () => {
      await reorderMenuItems(reordered.map((i) => i.id));
    });
  }

  const itemCount = items.length;

  return (
    <div className="overflow-hidden rounded-xl border border-rule bg-paper">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle */}
        <button
          {...dragHandleProps}
          className="cursor-grab touch-none rounded p-0.5 text-muted hover:text-ink active:cursor-grabbing"
          aria-label="Arrastrar para reordenar categoría"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-left"
          aria-expanded={expanded}
          aria-label={expanded ? 'Colapsar categoría' : 'Expandir categoría'}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
          )}

          {category.icon && (
            <span className="text-xl leading-none" aria-hidden>
              {category.icon}
            </span>
          )}

          {category.color && (
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: category.color }}
              aria-hidden
            />
          )}

          <span className="font-display text-base font-semibold text-ink">{category.name}</span>
        </button>

        <Badge variant="muted" className="ml-1">
          {itemCount} {itemCount === 1 ? 'platillo' : 'platillos'}
        </Badge>

        {!optimisticVisible && (
          <Badge variant="outline" className="shrink-0">
            Oculta
          </Badge>
        )}

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={handleToggleVisibility}
            className="rounded p-1.5 text-muted transition-colors hover:bg-cream hover:text-ink"
            aria-label={optimisticVisible ? 'Ocultar categoría' : 'Mostrar categoría'}
          >
            {optimisticVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>

          <EditCategoryDialog category={category} />

          <button
            onClick={handleDelete}
            className="rounded p-1.5 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label={`Eliminar categoría ${category.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-rule">
          {itemCount === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              No hay platillos en esta categoría.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleItemDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2 p-3">
                  {items.map((item) => (
                    <MenuItemRow key={item.id} item={item} categories={allCategories} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <div className="border-t border-rule px-3 py-2">
            <CreateItemDialog categoryId={category.id} categories={allCategories} />
          </div>
        </div>
      )}
    </div>
  );
}
