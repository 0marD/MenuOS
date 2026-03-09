'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Button } from '@menuos/ui/atoms/Button';
import { FormField } from '@menuos/ui/molecules/FormField';
import { menuItemSchema, type MenuItemInput } from '@menuos/shared/validations';
import { createItem } from '../actions';
import type { Tables } from '@menuos/database/types';

interface CreateItemDialogProps {
  categoryId: string;
  onCreated: (item: Tables<'menu_items'>) => void;
  onClose: () => void;
}

export function CreateItemDialog({ categoryId, onCreated, onClose }: CreateItemDialogProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MenuItemInput>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      is_available: true,
      is_sold_out_today: false,
      filters: [],
    },
  });

  function onSubmit(data: MenuItemInput) {
    startTransition(async () => {
      const result = await createItem(categoryId, data);
      if (result.data) {
        onCreated(result.data);
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-item-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
    >
      <div className="w-full max-w-sm rounded-xl bg-paper p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="create-item-title" className="font-display text-lg font-bold text-ink">
            Nuevo platillo
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <FormField
            label="Nombre"
            placeholder="Ej: Taco al pastor"
            required
            error={errors.name?.message}
            {...register('name')}
          />
          <FormField
            label="Descripción"
            placeholder="Ingredientes o descripción breve"
            error={errors.description?.message}
            {...register('description')}
          />
          <FormField
            label="Precio (MXN)"
            type="number"
            step="0.50"
            min="0"
            placeholder="0.00"
            required
            error={errors.price?.message}
            {...register('price', { valueAsNumber: true })}
          />
          <div className="mt-2 flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
