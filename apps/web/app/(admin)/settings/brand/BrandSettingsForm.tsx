'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Button, FormField, Input } from '@menuos/ui';
import { brandSettingsSchema, type BrandSettingsInput } from '@menuos/shared';
import type { Tables } from '@menuos/database';
import { updateBrandSettings } from './actions';

interface BrandSettingsFormProps {
  org: Pick<
    Tables<'organizations'>,
    'name' | 'slug' | 'logo_url' | 'banner_url' | 'primary_color' | 'secondary_color'
  >;
}

export function BrandSettingsForm({ org }: BrandSettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isDirty, isSubmitSuccessful },
  } = useForm<BrandSettingsInput>({
    resolver: zodResolver(brandSettingsSchema),
    defaultValues: {
      name: org.name,
      logo_url: org.logo_url ?? '',
      banner_url: org.banner_url ?? '',
      primary_color: org.primary_color ?? '',
      secondary_color: org.secondary_color ?? '',
    },
  });

  const logoUrl = watch('logo_url');
  const bannerUrl = watch('banner_url');
  const primaryColor = watch('primary_color');
  const secondaryColor = watch('secondary_color');

  function onSubmit(data: BrandSettingsInput) {
    startTransition(async () => {
      const result = await updateBrandSettings(data);
      if (result?.error) {
        setError('root', { message: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      <section className="rounded-xl border border-rule bg-paper p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink">Información general</h2>
        <FormField
          label="Nombre del restaurante"
          htmlFor="brand-name"
          error={errors.name?.message}
          required
        >
          <Input
            id="brand-name"
            autoFocus
            error={!!errors.name}
            {...register('name')}
          />
        </FormField>
      </section>

      <section className="rounded-xl border border-rule bg-paper p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink">Imágenes</h2>
        <div className="flex flex-col gap-4">
          <FormField
            label="URL del logotipo"
            htmlFor="brand-logo"
            error={errors.logo_url?.message}
            hint="Ingresa la URL pública de tu logo (PNG/SVG, fondo transparente recomendado)"
          >
            <Input
              id="brand-logo"
              type="url"
              placeholder="https://..."
              error={!!errors.logo_url}
              {...register('logo_url')}
            />
          </FormField>

          {logoUrl && (
            <div className="relative h-20 w-40 overflow-hidden rounded border border-rule bg-cream">
              <Image
                src={logoUrl}
                alt="Vista previa del logo"
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>
          )}

          <FormField
            label="URL del banner"
            htmlFor="brand-banner"
            error={errors.banner_url?.message}
            hint="Imagen de portada del menú público (16:9 recomendado)"
          >
            <Input
              id="brand-banner"
              type="url"
              placeholder="https://..."
              error={!!errors.banner_url}
              {...register('banner_url')}
            />
          </FormField>

          {bannerUrl && (
            <div className="relative h-32 w-full overflow-hidden rounded border border-rule bg-cream">
              <Image
                src={bannerUrl}
                alt="Vista previa del banner"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-rule bg-paper p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink">Colores de marca</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Color primario"
            htmlFor="brand-primary"
            error={errors.primary_color?.message}
            hint="Color principal del menú del cliente"
          >
            <div className="flex gap-2">
              <Input
                id="brand-primary"
                maxLength={7}
                placeholder="#D4500A"
                error={!!errors.primary_color}
                {...register('primary_color')}
              />
              <input
                type="color"
                value={primaryColor || '#D4500A'}
                className="h-10 w-10 shrink-0 cursor-pointer rounded border border-rule"
                onChange={(e) => setValue('primary_color', e.target.value, { shouldDirty: true })}
                aria-label="Seleccionar color primario"
              />
            </div>
          </FormField>

          <FormField
            label="Color secundario"
            htmlFor="brand-secondary"
            error={errors.secondary_color?.message}
            hint="Color de acentos y botones secundarios"
          >
            <div className="flex gap-2">
              <Input
                id="brand-secondary"
                maxLength={7}
                placeholder="#0F0E0C"
                error={!!errors.secondary_color}
                {...register('secondary_color')}
              />
              <input
                type="color"
                value={secondaryColor || '#0F0E0C'}
                className="h-10 w-10 shrink-0 cursor-pointer rounded border border-rule"
                onChange={(e) =>
                  setValue('secondary_color', e.target.value, { shouldDirty: true })
                }
                aria-label="Seleccionar color secundario"
              />
            </div>
          </FormField>
        </div>
      </section>

      {errors.root && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors.root.message}
        </p>
      )}

      {isSubmitSuccessful && !isDirty && (
        <p role="status" className="rounded bg-green/10 px-3 py-2 text-sm text-green">
          Cambios guardados correctamente.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || !isDirty}>
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
