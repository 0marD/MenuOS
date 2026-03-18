'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
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
import { updateMenuItem } from '../actions';
import { PhotoUpload } from './PhotoUpload';

interface EditItemDialogProps {
  item: Tables<'menu_items'>;
  categories: Pick<Tables<'menu_categories'>, 'id' | 'name'>[];
}

export function EditItemDialog({ item, categories }: EditItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<MenuItemInput>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: item.name,
      description: item.description ?? '',
      base_price: item.base_price,
      photo_url: item.photo_url ?? '',
      category_id: item.category_id,
      preparation_time_minutes: item.preparation_time_minutes ?? undefined,
      is_available: item.is_available,
      is_special: item.is_special,
      is_vegetarian: item.is_vegetarian,
      is_gluten_free: item.is_gluten_free,
      is_spicy: item.is_spicy,
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
      const result = await updateMenuItem(item.id, data);
      if (result?.error) {
        setError('root', { message: result.error });
        return;
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded p-1.5 text-muted transition-colors hover:bg-cream hover:text-ink"
          aria-label={`Editar ${item.name}`}
        >
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar platillo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField label="Nombre" htmlFor="edit-item-name" error={errors.name?.message} required>
            <Input
              id="edit-item-name"
              autoFocus
              error={!!errors.name}
              {...register('name')}
            />
          </FormField>

          <FormField
            label="Descripción"
            htmlFor="edit-item-desc"
            error={errors.description?.message}
          >
            <textarea
              id="edit-item-desc"
              rows={2}
              maxLength={500}
              className="w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              {...register('description')}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Precio (MXN)"
              htmlFor="edit-item-price"
              error={errors.base_price?.message}
              required
            >
              <Input
                id="edit-item-price"
                type="number"
                min="0.01"
                step="0.01"
                error={!!errors.base_price}
                {...register('base_price', { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              label="Tiempo de prep. (min)"
              htmlFor="edit-item-prep"
              error={errors.preparation_time_minutes?.message}
            >
              <Input
                id="edit-item-prep"
                type="number"
                min="1"
                step="1"
                {...register('preparation_time_minutes', { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <FormField
            label="Categoría"
            htmlFor="edit-item-category"
            error={errors.category_id?.message}
            required
          >
            <select
              id="edit-item-category"
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
              {isPending ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
