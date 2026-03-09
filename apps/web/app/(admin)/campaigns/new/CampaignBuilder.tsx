'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@menuos/ui/atoms/Button';
import { Badge } from '@menuos/ui/atoms/Badge';
import { cn } from '@menuos/ui';
import { campaignSchema, type CampaignInput } from '@menuos/shared/validations';
import { createCampaign } from '../actions';

interface SegmentCounts {
  all: number;
  new: number;
  frequent: number;
  dormant: number;
}

interface CampaignBuilderProps {
  orgId: string;
  segmentCounts: SegmentCounts;
}

const SEGMENTS = [
  { value: 'all', label: 'Todos', description: 'Clientes con marketing activo' },
  { value: 'new', label: 'Nuevos', description: 'Registrados con 1–2 visitas' },
  { value: 'frequent', label: 'Frecuentes', description: '3+ visitas' },
  { value: 'dormant', label: 'Dormidos', description: 'Sin visita en 21+ días' },
] as const;

const MESSAGE_TEMPLATES = [
  {
    id: 'promo',
    label: 'Promoción',
    message: '¡Hola {{nombre}}! 🎉 Tenemos una promoción especial para ti. Visítanos esta semana y disfruta {{promoción}}. ¡Te esperamos!',
  },
  {
    id: 'reminder',
    label: 'Te extrañamos',
    message: '¡Hola {{nombre}}! 😊 Hace tiempo que no te vemos. Ven a visitarnos y disfruta de nuestro menú. ¡Tenemos novedades que te van a encantar!',
  },
  {
    id: 'announcement',
    label: 'Anuncio',
    message: '¡Hola {{nombre}}! 📣 Queremos compartir contigo una novedad: {{mensaje}}. ¡Gracias por ser parte de nuestra comunidad!',
  },
  {
    id: 'custom',
    label: 'Personalizado',
    message: '',
  },
] as const;

const MAX_MESSAGE_LENGTH = 1024;

export function CampaignBuilder({ orgId, segmentCounts }: CampaignBuilderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CampaignInput>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      segment: 'all',
      message: '',
      scheduled_at: null,
    },
  });

  const message = watch('message');
  const segment = watch('segment');
  const scheduledAt = watch('scheduled_at');

  const recipientCount = segmentCounts[segment as keyof typeof segmentCounts] ?? 0;

  function applyTemplate(templateMessage: string, id: string) {
    setSelectedTemplate(id);
    if (id !== 'custom') {
      setValue('message', templateMessage, { shouldValidate: true });
    } else {
      setValue('message', '');
    }
  }

  function onSubmit(data: CampaignInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await createCampaign(orgId, data);
      if (result.success) {
        router.push('/admin/campaigns');
      } else {
        setServerError(result.error ?? 'Error al guardar la campaña');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* Name */}
      <section aria-labelledby="name-heading">
        <h2 id="name-heading" className="mb-3 text-sm font-semibold font-sans text-ink">
          Nombre interno
        </h2>
        <div className="rounded-xl border border-rule bg-card p-4">
          <label htmlFor="campaign-name" className="mb-1 block text-xs font-medium font-sans text-muted">
            Nombre de la campaña (solo visible para ti)
          </label>
          <input
            id="campaign-name"
            type="text"
            placeholder="Ej: Promo fin de semana marzo"
            {...register('name')}
            className="h-10 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-sans placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" role="alert" className="mt-1 text-xs text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>
      </section>

      {/* Segment */}
      <section aria-labelledby="segment-heading">
        <h2 id="segment-heading" className="mb-3 text-sm font-semibold font-sans text-ink">
          Segmento de audiencia
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {SEGMENTS.map(({ value, label, description }) => {
            const count = segmentCounts[value];
            const isSelected = segment === value;
            return (
              <label
                key={value}
                className={cn(
                  'flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-3 transition-all',
                  isSelected ? 'border-accent bg-accent/5' : 'border-rule bg-card hover:border-muted'
                )}
              >
                <input
                  type="radio"
                  value={value}
                  {...register('segment')}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-sans font-medium text-ink">{label}</span>
                  <Badge variant={isSelected ? 'default' : 'outline'} className="text-xs">
                    {count}
                  </Badge>
                </div>
                <span className="text-xs font-sans text-muted">{description}</span>
              </label>
            );
          })}
        </div>
        {recipientCount === 0 && (
          <p className="mt-2 text-xs font-sans text-muted">
            No hay clientes en este segmento con marketing activo.
          </p>
        )}
      </section>

      {/* Template selector */}
      <section aria-labelledby="template-heading">
        <h2 id="template-heading" className="mb-3 text-sm font-semibold font-sans text-ink">
          Plantilla de mensaje
        </h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {MESSAGE_TEMPLATES.map(({ id, label, message: tpl }) => (
            <button
              key={id}
              type="button"
              onClick={() => applyTemplate(tpl, id)}
              aria-pressed={selectedTemplate === id}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-sans transition-colors',
                selectedTemplate === id
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-rule bg-cream text-foreground hover:bg-paper'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Message textarea */}
        <div className="rounded-xl border border-rule bg-card p-4">
          <label htmlFor="campaign-message" className="mb-1 block text-xs font-medium font-sans text-muted">
            Mensaje · <span className="font-mono">{'{{nombre}}'}</span> se reemplaza con el nombre del cliente
          </label>
          <textarea
            id="campaign-message"
            rows={5}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Escribe tu mensaje aquí..."
            {...register('message')}
            className="w-full resize-none rounded-lg border border-rule bg-cream px-3 py-2 text-sm font-sans placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            aria-describedby={errors.message ? 'message-error' : 'message-count'}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.message ? (
              <p id="message-error" role="alert" className="text-xs text-destructive">
                {errors.message.message}
              </p>
            ) : (
              <span id="message-count" className="text-xs font-mono text-muted">
                {message.length} / {MAX_MESSAGE_LENGTH}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section aria-labelledby="schedule-heading">
        <h2 id="schedule-heading" className="mb-3 text-sm font-semibold font-sans text-ink">
          Envío
        </h2>
        <div className="rounded-xl border border-rule bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-sans text-ink cursor-pointer">
              <input
                type="radio"
                name="send-timing"
                value="now"
                defaultChecked
                onChange={() => setValue('scheduled_at', null)}
                className="accent-accent"
              />
              Enviar ahora
            </label>
            <label className="flex items-center gap-2 text-sm font-sans text-ink cursor-pointer">
              <input
                type="radio"
                name="send-timing"
                value="schedule"
                onChange={() => setValue('scheduled_at', '')}
                className="accent-accent"
              />
              Programar
            </label>
          </div>
          {scheduledAt !== null && scheduledAt !== undefined && (
            <div>
              <label htmlFor="scheduled-at" className="mb-1 block text-xs font-medium font-sans text-muted">
                Fecha y hora de envío
              </label>
              <input
                id="scheduled-at"
                type="datetime-local"
                {...register('scheduled_at')}
                min={new Date().toISOString().slice(0, 16)}
                className="h-10 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          )}
        </div>
      </section>

      {/* Preview & Actions */}
      <div className="rounded-xl border border-rule bg-cream p-4">
        <p className="text-xs font-mono text-muted">Vista previa del mensaje</p>
        <div className="mt-2 rounded-lg bg-green/10 p-3 text-sm font-sans text-ink min-h-[60px]">
          {message
            ? message.replace(/\{\{nombre\}\}/g, 'María')
            : <span className="text-muted">El mensaje aparecerá aquí...</span>
          }
        </div>
        <p className="mt-2 text-xs font-sans text-muted">
          Se enviará a <strong>{recipientCount}</strong> cliente{recipientCount !== 1 ? 's' : ''}.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/campaigns')}
          disabled={isPending}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending || recipientCount === 0}
          className="flex-1"
        >
          {isPending ? 'Guardando...' : scheduledAt ? 'Programar campaña' : 'Guardar borrador'}
        </Button>
      </div>
    </form>
  );
}
