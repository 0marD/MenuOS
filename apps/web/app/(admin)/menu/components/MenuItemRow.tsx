'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@menuos/ui/atoms/Button';
import { Toggle } from '@menuos/ui/atoms/Toggle';
import { Badge } from '@menuos/ui/atoms/Badge';
import { cn } from '@menuos/ui';
import { EditItemDialog } from './EditItemDialog';
import { toggleItemSoldOut, deleteItem } from '../actions';
import type { Tables } from '@menuos/database/types';

type MenuItemWithRelations = Tables<'menu_items'> & {
  menu_item_photos: Array<{ url: string; position: number }>;
  menu_item_filters: Array<{ filter: string }>;
};

interface MenuItemRowProps {
  item: MenuItemWithRelations;
  onUpdated: (item: Tables<'menu_items'>) => void;
  onDeleted: (id: string) => void;
}

export function MenuItemRow({ item, onUpdated, onDeleted }: MenuItemRowProps) {
  const [isSoldOut, setIsSoldOut] = useState(item.is_sold_out_today);
  const [isEditing, setIsEditing] = useState(false);

  const photo = item.menu_item_photos[0];
  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(item.price));

  async function handleToggleSoldOut() {
    const newValue = !isSoldOut;
    setIsSoldOut(newValue);
    await toggleItemSoldOut(item.id, newValue);
    onUpdated({ ...item, is_sold_out_today: newValue });
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${item.name}"?`)) return;
    await deleteItem(item.id);
    onDeleted(item.id);
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-paper/50',
        isSoldOut && 'opacity-60'
      )}
    >
      {photo && (
        <img
          src={photo.url}
          alt=""
          className="h-10 w-10 shrink-0 rounded-md object-cover"
          loading="lazy"
        />
      )}
      {!photo && (
        <div className="h-10 w-10 shrink-0 rounded-md bg-rule/40" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="truncate text-sm font-medium font-sans text-ink">{item.name}</p>
          {isSoldOut && (
            <Badge variant="soldOut" className="shrink-0 text-[10px]">Agotado</Badge>
          )}
        </div>
        {item.description && (
          <p className="truncate text-xs font-sans text-muted">{item.description}</p>
        )}
      </div>
      <span className="shrink-0 text-sm font-mono font-medium text-ink">
        {formattedPrice}
      </span>
      <Toggle
        pressed={isSoldOut}
        onPressedChange={handleToggleSoldOut}
        aria-label={isSoldOut ? 'Marcar disponible' : 'Marcar agotado'}
        size="sm"
        variant="outline"
        className="text-[10px] px-2 h-7"
      >
        {isSoldOut ? 'Disponible' : 'Agotado'}
      </Toggle>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        aria-label={`Editar ${item.name}`}
        onClick={() => setIsEditing(true)}
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
        aria-label={`Eliminar ${item.name}`}
        onClick={handleDelete}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
      {isEditing && (
        <EditItemDialog
          item={item}
          onUpdated={(updated) => {
            onUpdated(updated);
            setIsEditing(false);
          }}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
