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
import { menuItemSchema, type MenuItemInput } from '@menuos/shared';
import type { Tables } from '@menuos/database';
import { createMenuItem } from '../actions';
import { PhotoUpload } from './PhotoUpload';

interface CreateItemDialogProps {
  categoryId: string;
  categories: Pick<Tables<'menu_categories'>, 'id' | 'name'>[];
}

export function CreateItemDialog({ categoryId, categories }: CreateItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<MenuItemInput>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      category_id: categoryId,
      is_available: true,
      is_special: false,
      is_vegetarian: false,
      is_gluten_free: false,
      is_spicy: false,
    },
  });

  const isAvailable = watch('is_available');
  const isSpecial = watch('is_special');
  const isVegetarian = watch('is_vegetarian');
  const isGlutenFree = watch('is_gluten_free');
  const isSpicy = watch('is_spicy');
  const photoUrl = watch('photo_url');

  function onSubmit(data: MenuItemInput) {
    startTransition(async () => {
      const result = await createMenuItem(data);
      if (result?.error) {
        setError('root', { message: result.error });
        return;
      }
      reset({ category_id: categoryId, is_available: true, is_special: false, is_vegetarian: false, is_gluten_free: false, is_spicy: false });
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nuevo platillo
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo platillo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField label="Nombre" htmlFor="create-item-name" error={errors.name?.message} required>
            <Input
              id="create-item-name"
              autoFocus
              error={!!errors.name}
              {...register('name')}
            />
          </FormField>

          <FormField
            label="Descripción"
            htmlFor="create-item-desc"
            error={errors.description?.message}
          >
            <textarea
              id="create-item-desc"
              rows={2}
              maxLength={500}
              className="w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              {...register('description')}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Precio (MXN)"
              htmlFor="create-item-price"
              error={errors.base_price?.message}
              required
            >
              <Input
                id="create-item-price"
                type="number"
                min="0.01"
                step="0.01"
                error={!!errors.base_price}
                {...register('base_price', { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              label="Tiempo de prep. (min)"
              htmlFor="create-item-prep"
              error={errors.preparation_time_minutes?.message}
            >
              <Input
                id="create-item-prep"
                type="number"
                min="1"
                step="1"
                {...register('preparation_time_minutes', { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <FormField
            label="Categoría"
            htmlFor="create-item-category"
            error={errors.category_id?.message}
            required
          >
            <select
              id="create-item-category"
              className="w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              {...register('category_id')}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </FormField>

          <div>
            <p className="mb-1.5 text-sm font-medium text-ink">Foto del platillo</p>
            <PhotoUpload
              currentUrl={photoUrl ?? ''}
              onUrlChange={(url) => setValue('photo_url', url, { shouldDirty: true })}
              onError={(msg) => setError('photo_url', { message: msg })}
            />
            {errors.photo_url && (
              <p className="mt-1 text-xs text-red-600">{errors.photo_url.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded border border-rule px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">Disponible</p>
                <p className="text-xs text-muted">Se puede pedir hoy</p>
              </div>
              <Switch
                checked={isAvailable}
                onCheckedChange={(v) => setValue('is_available', v)}
                aria-label="Disponibilidad del platillo"
              />
            </div>

            <div className="flex items-center justify-between rounded border border-rule px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">Especial</p>
                <p className="text-xs text-muted">Destacado en el menú</p>
              </div>
              <Switch
                checked={isSpecial}
                onCheckedChange={(v) => setValue('is_special', v)}
                aria-label="Platillo especial"
              />
            </div>

            <p className="pt-1 text-xs font-medium uppercase tracking-widest text-muted">Filtros dietéticos</p>

            {[
              { label: '🥦 Vegetariano', desc: 'Sin carne ni mariscos', field: 'is_vegetarian' as const, value: isVegetarian },
              { label: '🌾 Sin gluten', desc: 'Apto para celíacos', field: 'is_gluten_free' as const, value: isGlutenFree },
              { label: '🌶️ Picante', desc: 'Contiene chile o especias fuertes', field: 'is_spicy' as const, value: isSpicy },
            ].map(({ label, desc, field, value }) => (
              <div key={field} className="flex items-center justify-between rounded border border-rule px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{label}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(v) => setValue(field, v)}
                  aria-label={label}
                />
              </div>
            ))}
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
              {isPending ? 'Creando…' : 'Crear platillo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
