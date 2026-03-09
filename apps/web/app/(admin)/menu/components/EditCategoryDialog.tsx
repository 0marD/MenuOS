'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Button } from '@menuos/ui/atoms/Button';
import { FormField } from '@menuos/ui/molecules/FormField';
import { menuCategorySchema, type MenuCategoryInput } from '@menuos/shared/validations';
import { updateCategory } from '../actions';
import type { Tables } from '@menuos/database/types';

interface EditCategoryDialogProps {
  category: Tables<'menu_categories'>;
  onUpdated: (category: Tables<'menu_categories'>) => void;
  onClose: () => void;
}

export function EditCategoryDialog({ category, onUpdated, onClose }: EditCategoryDialogProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MenuCategoryInput>({
    resolver: zodResolver(menuCategorySchema),
    defaultValues: {
      name: category.name,
      icon: category.icon ?? undefined,
      sort_order: category.sort_order,
      is_visible: category.is_visible,
    },
  });

  function onSubmit(data: MenuCategoryInput) {
    startTransition(async () => {
      const result = await updateCategory(category.id, data);
      if (result.data) {
        onUpdated(result.data);
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-category-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
    >
      <div className="w-full max-w-sm rounded-xl bg-paper p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="edit-category-title" className="font-display text-lg font-bold text-ink">
            Editar categoría
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
            label="Ícono (emoji)"
            placeholder="🌮"
            error={errors.icon?.message}
            {...register('icon')}
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
