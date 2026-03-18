'use client';

import { GripVertical, Trash2 } from 'lucide-react';
import { useOptimistic, useTransition } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@menuos/ui';
import { formatMXN } from '@menuos/shared';
import type { Tables } from '@menuos/database';
import { deleteMenuItem, toggleMenuItemAvailable, toggleMenuItemSoldOut } from '../actions';
import { EditItemDialog } from './EditItemDialog';

interface MenuItemRowProps {
  item: Tables<'menu_items'>;
  categories: Pick<Tables<'menu_categories'>, 'id' | 'name'>[];
}

export function MenuItemRow({ item, categories }: MenuItemRowProps) {
  const [, startTransition] = useTransition();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const [optimisticAvailable, setOptimisticAvailable] = useOptimistic(item.is_available);
  const [optimisticSoldOut, setOptimisticSoldOut] = useOptimistic(
    (item as Tables<'menu_items'> & { is_sold_out_today?: boolean }).is_sold_out_today ?? false,
  );

  function handleToggleAvailable() {
    startTransition(async () => {
      setOptimisticAvailable(!optimisticAvailable);
      await toggleMenuItemAvailable(item.id, !optimisticAvailable);
    });
  }

  function handleToggleSoldOut() {
    startTransition(async () => {
      setOptimisticSoldOut(!optimisticSoldOut);
      await toggleMenuItemSoldOut(item.id, !optimisticSoldOut);
    });
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar "${item.name}"? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => { await deleteMenuItem(item.id); });
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-rule bg-paper px-4 py-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded p-0.5 text-muted hover:text-ink active:cursor-grabbing"
        aria-label="Arrastrar para reordenar platillo"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-ink">{item.name}</span>
          {item.is_special && (
            <Badge variant="warning" className="shrink-0">
              Especial
            </Badge>
          )}
          {optimisticSoldOut && (
            <Badge variant="destructive" className="shrink-0">
              Agotado
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="mt-0.5 truncate text-xs text-muted">{item.description}</p>
        )}
      </div>

      <span className="shrink-0 font-mono text-sm text-ink">{formatMXN(item.base_price)}</span>

      {item.preparation_time_minutes && (
        <span className="shrink-0 text-xs text-muted">{item.preparation_time_minutes} min</span>
      )}

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={handleToggleAvailable}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            optimisticAvailable
              ? 'bg-green/10 text-green hover:bg-green/20'
              : 'bg-cream text-muted hover:bg-rule'
          }`}
          aria-label={optimisticAvailable ? 'Marcar como no disponible' : 'Marcar como disponible'}
        >
          {optimisticAvailable ? 'Disponible' : 'No disponible'}
        </button>

        <button
          onClick={handleToggleSoldOut}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            optimisticSoldOut
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-cream text-muted hover:bg-rule'
          }`}
          aria-label={optimisticSoldOut ? 'Marcar como disponible' : 'Marcar como agotado'}
        >
          {optimisticSoldOut ? 'Agotado' : 'En stock'}
        </button>

        <EditItemDialog item={item} categories={categories} />

        <button
          onClick={handleDelete}
          className="rounded p-1.5 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
          aria-label={`Eliminar ${item.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
