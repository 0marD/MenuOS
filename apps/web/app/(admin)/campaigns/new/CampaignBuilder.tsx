'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Button, FormField, Input } from '@menuos/ui';
import { campaignSchema, type CampaignInput } from '@menuos/shared';
import { createCampaign } from '../actions';

const SEGMENTS = [
  { value: 'all', label: 'Todos los clientes' },
  { value: 'new', label: 'Nuevos (primera visita)' },
  { value: 'frequent', label: 'Frecuentes (3+ visitas)' },
  { value: 'dormant', label: 'Dormidos (+21 días sin visitar)' },
];

export function CampaignBuilder() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CampaignInput>({
    resolver: zodResolver(campaignSchema),
    defaultValues: { segment: 'all' },
  });

  function onSubmit(data: CampaignInput) {
    startTransition(async () => {
      const result = await createCampaign(data);
      if (result?.error) {
        setError('root', { message: result.error });
        return;
      }
      router.push('/campaigns');
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      <section className="rounded-xl border border-rule bg-paper p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink">Información básica</h2>
        <div className="flex flex-col gap-4">
          <FormField
            label="Nombre de la campaña"
            htmlFor="camp-name"
            error={errors.name?.message}
            required
          >
            <Input
              id="camp-name"
              autoFocus
              placeholder="Ej. Promo fin de semana"
              error={!!errors.name}
              {...register('name')}
            />
          </FormField>

          <FormField
            label="Template de WhatsApp"
            htmlFor="camp-template"
            error={errors.template_name?.message}
            hint="Nombre exacto del template aprobado en Meta Business Manager"
            required
          >
            <Input
              id="camp-template"
              placeholder="ej. promo_fin_semana"
              error={!!errors.template_name}
              {...register('template_name')}
            />
          </FormField>
        </div>
      </section>

      <section className="rounded-xl border border-rule bg-paper p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink">Audiencia</h2>
        <FormField
          label="Segmento de clientes"
          htmlFor="camp-segment"
          error={errors.segment?.message}
          required
        >
          <select
            id="camp-segment"
            className="w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            {...register('segment')}
          >
            {SEGMENTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </FormField>
      </section>

      <section className="rounded-xl border border-rule bg-paper p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink">
          Mensaje (opcional)
        </h2>
        <FormField
          label="Cuerpo del mensaje"
          htmlFor="camp-body"
          error={errors.message_body?.message}
          hint="Parámetros del template, si aplica"
        >
          <textarea
            id="camp-body"
            rows={4}
            maxLength={1024}
            className="w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            {...register('message_body')}
          />
        </FormField>
      </section>

      <section className="rounded-xl border border-rule bg-paper p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink">Programación</h2>
        <FormField
          label="Enviar el (opcional)"
          htmlFor="camp-schedule"
          error={errors.scheduled_at?.message}
          hint="Deja en blanco para guardar como borrador"
        >
          <Input
            id="camp-schedule"
            type="datetime-local"
            {...register('scheduled_at')}
          />
        </FormField>
      </section>

      {errors.root && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors.root.message}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar campaña'}
        </Button>
      </div>
    </form>
  );
}
