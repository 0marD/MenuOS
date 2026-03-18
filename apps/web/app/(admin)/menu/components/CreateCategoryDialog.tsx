'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Button, FormField, Input, Switch } from '@menuos/ui';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { categorySchema, type CategoryInput } from '@menuos/shared';
import { createCategory } from '../actions';

export function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { is_visible: true },
  });

  const isVisible = watch('is_visible');

  function onSubmit(data: CategoryInput) {
    startTransition(async () => {
      const result = await createCategory(data);
      if (result?.error) {
        setError('root', { message: result.error });
        return;
      }
      reset();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4" />
          Nueva categoría
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva categoría</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField label="Nombre" htmlFor="cat-name" error={errors.name?.message} required>
            <Input
              id="cat-name"
              placeholder="Entradas, Postres, Bebidas…"
              error={!!errors.name}
              autoFocus
              {...register('name')}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ícono (emoji)" htmlFor="cat-icon" error={errors.icon?.message}>
              <Input
                id="cat-icon"
                placeholder="🍕"
                maxLength={4}
                className="text-xl"
                {...register('icon')}
              />
            </FormField>

            <FormField label="Color (hex)" htmlFor="cat-color" error={errors.color?.message}>
              <div className="flex gap-2">
                <Input
                  id="cat-color"
                  placeholder="#D4500A"
                  maxLength={7}
                  {...register('color')}
                />
                <input
                  type="color"
                  className="h-10 w-10 shrink-0 cursor-pointer rounded border border-rule"
                  onChange={(e) => setValue('color', e.target.value)}
                  aria-label="Seleccionar color"
                />
              </div>
            </FormField>
          </div>

          <div className="flex items-center justify-between rounded border border-rule px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">Visible en el menú</p>
              <p className="text-xs text-muted">Los comensales pueden verla</p>
            </div>
            <Switch
              checked={isVisible}
              onCheckedChange={(v) => setValue('is_visible', v)}
              aria-label="Visibilidad de la categoría"
            />
          </div>

          {errors.root && (
            <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
              {errors.root.message}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creando…' : 'Crear categoría'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
