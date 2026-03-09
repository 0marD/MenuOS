'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@menuos/ui/atoms/Button';
import { FormField } from '@menuos/ui/molecules/FormField';
import { Badge } from '@menuos/ui/atoms/Badge';
import { cn } from '@menuos/ui';
import { orgBrandSchema, type OrgBrandInput } from '@menuos/shared/validations';
import { updateBrandSettings } from './actions';
import type { Tables } from '@menuos/database/types';

interface BrandSettingsFormProps {
  org: Pick<Tables<'organizations'>, 'id' | 'name' | 'slug' | 'logo_url' | 'banner_url' | 'colors'>;
  templates: Array<{ id: string; name: string; slug: string; preview_url: string | null }>;
  currentTemplateSlug: string;
}

export function BrandSettingsForm({ org, templates, currentTemplateSlug }: BrandSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplateSlug);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrgBrandInput>({
    resolver: zodResolver(orgBrandSchema),
    defaultValues: {
      logo_url: org.logo_url ?? undefined,
      banner_url: org.banner_url ?? undefined,
    },
  });

  function onSubmit(data: OrgBrandInput) {
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await updateBrandSettings(org.id, { ...data, template_slug: selectedTemplate });
      if (result.success) {
        setSuccessMessage('Cambios guardados correctamente');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {successMessage && (
        <div role="status" className="rounded-md bg-green/10 px-3 py-2 text-sm text-green">
          {successMessage}
        </div>
      )}

      {/* Restaurant info */}
      <section aria-labelledby="brand-info-heading">
        <h2 id="brand-info-heading" className="mb-3 text-sm font-semibold font-sans text-ink">
          Información del restaurante
        </h2>
        <div className="space-y-3 rounded-xl border border-rule bg-card p-4">
          <div>
            <p className="text-xs font-mono text-muted">Nombre público</p>
            <p className="text-sm font-sans text-ink">{org.name}</p>
          </div>
          <div>
            <p className="text-xs font-mono text-muted">URL del menú</p>
            <p className="text-sm font-mono text-accent">
              menuos.mx/<span className="font-bold">{org.slug}</span>
            </p>
            <p className="text-xs font-sans text-muted mt-0.5">Esta URL es permanente y no puede cambiarse</p>
          </div>
        </div>
      </section>

      {/* Logo & banner */}
      <section aria-labelledby="brand-media-heading">
        <h2 id="brand-media-heading" className="mb-3 text-sm font-semibold font-sans text-ink">
          Logo y banner
        </h2>
        <div className="space-y-3 rounded-xl border border-rule bg-card p-4">
          <FormField
            label="URL del logo"
            type="url"
            placeholder="https://..."
            hint="Imagen cuadrada, mínimo 200×200px"
            error={errors.logo_url?.message}
            {...register('logo_url')}
          />
          <FormField
            label="URL del banner"
            type="url"
            placeholder="https://..."
            hint="Imagen rectangular, recomendado 1200×400px"
            error={errors.banner_url?.message}
            {...register('banner_url')}
          />
        </div>
      </section>

      {/* Template selector */}
      <section aria-labelledby="brand-template-heading">
        <h2 id="brand-template-heading" className="mb-3 text-sm font-semibold font-sans text-ink">
          Plantilla de menú
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelectedTemplate(template.slug)}
              aria-pressed={selectedTemplate === template.slug}
              className={cn(
                'relative rounded-xl border-2 p-3 text-center transition-all',
                selectedTemplate === template.slug
                  ? 'border-accent bg-accent/5'
                  : 'border-rule bg-card hover:border-muted'
              )}
            >
              <div className="mb-2 h-16 rounded-lg bg-rule/40" aria-hidden="true" />
              <p className="text-xs font-sans font-medium text-ink">{template.name}</p>
              {selectedTemplate === template.slug && (
                <Badge variant="default" className="absolute -top-1.5 -right-1.5 text-[9px] px-1 h-4">
                  Activa
                </Badge>
              )}
            </button>
          ))}
        </div>
      </section>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </form>
  );
}
