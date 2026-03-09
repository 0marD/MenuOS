'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Button } from '@menuos/ui/atoms/Button';
import { FormField } from '@menuos/ui/molecules/FormField';
import { menuCategorySchema, type MenuCategoryInput } from '@menuos/shared/validations';
import { createCategory } from '../actions';
import type { Tables } from '@menuos/database/types';

interface CreateCategoryDialogProps {
  onCreated: (category: Tables<'menu_categories'>) => void;
  onClose: () => void;
}

export function CreateCategoryDialog({ onCreated, onClose }: CreateCategoryDialogProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MenuCategoryInput>({
    resolver: zodResolver(menuCategorySchema),
    defaultValues: { sort_order: 0, is_visible: true },
  });

  function onSubmit(data: MenuCategoryInput) {
    startTransition(async () => {
      const result = await createCategory(data);
      if (result.data) {
        onCreated(result.data);
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-category-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
    >
      <div className="w-full max-w-sm rounded-xl bg-paper p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="create-category-title" className="font-display text-lg font-bold text-ink">
            Nueva categoría
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <FormField
            label="Nombre"
            placeholder="Ej: Tacos, Bebidas, Postres"
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
              {isPending ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
