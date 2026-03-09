'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Button } from '@menuos/ui/atoms/Button';
import { FormField } from '@menuos/ui/molecules/FormField';
import { menuItemSchema, type MenuItemInput } from '@menuos/shared/validations';
import { updateItem } from '../actions';
import type { Tables } from '@menuos/database/types';

type MenuItemWithRelations = Tables<'menu_items'> & {
  menu_item_photos: Array<{ url: string; position: number }>;
  menu_item_filters: Array<{ filter: string }>;
};

interface EditItemDialogProps {
  item: MenuItemWithRelations;
  onUpdated: (item: Tables<'menu_items'>) => void;
  onClose: () => void;
}

export function EditItemDialog({ item, onUpdated, onClose }: EditItemDialogProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MenuItemInput>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: item.name,
      description: item.description ?? undefined,
      price: Number(item.price),
      is_available: item.is_available,
      is_sold_out_today: item.is_sold_out_today,
      prep_time: item.prep_time ?? undefined,
      filters: item.menu_item_filters.map((f) => f.filter as MenuItemInput['filters'][number]),
    },
  });

  function onSubmit(data: MenuItemInput) {
    startTransition(async () => {
      const result = await updateItem(item.id, data);
      if (result.data) {
        onUpdated(result.data);
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-item-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
    >
      <div className="w-full max-w-sm rounded-xl bg-paper p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="edit-item-title" className="font-display text-lg font-bold text-ink">
            Editar platillo
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <FormField
            label="Nombre"
            required
            error={errors.name?.message}
            {...register('name')}
          />
          <FormField
            label="Descripción"
            error={errors.description?.message}
            {...register('description')}
          />
          <FormField
            label="Precio (MXN)"
            type="number"
            step="0.50"
            min="0"
            required
            error={errors.price?.message}
            {...register('price', { valueAsNumber: true })}
          />
          <FormField
            label="Tiempo de preparación (min)"
            type="number"
            min="0"
            max="120"
            error={errors.prep_time?.message}
            {...register('prep_time', { valueAsNumber: true })}
          />
          <div className="mt-2 flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
