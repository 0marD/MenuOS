'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Gift, Stamp } from 'lucide-react';
import { Button } from '@menuos/ui/atoms/Button';
import { Badge } from '@menuos/ui/atoms/Badge';
import { Switch } from '@menuos/ui/atoms/Switch';
import { cn } from '@menuos/ui';
import { loyaltyProgramSchema, type LoyaltyProgramInput } from '@menuos/shared/validations';
import { createLoyaltyProgram, toggleLoyaltyProgram } from './actions';

interface Program {
  id: string;
  name: string;
  stamps_required: number;
  reward_type: 'free_item' | 'discount' | 'custom';
  reward_value: string;
  expiration_days: number | null;
  is_active: boolean;
}

interface LoyaltyManagerProps {
  programs: Program[];
  analytics: Record<string, { total: number; completed: number }>;
  orgId: string;
  isAdmin: boolean;
}

const REWARD_TYPE_LABELS: Record<string, string> = {
  free_item: 'Producto gratis',
  discount: 'Descuento',
  custom: 'Personalizado',
};

function StampDots({ count, required }: { count: number; required: number }) {
  return (
    <div className="flex flex-wrap gap-1" aria-label={`${count} de ${required} sellos`}>
      {Array.from({ length: required }, (_, i) => (
        <span
          key={i}
          className={cn(
            'inline-block h-4 w-4 rounded-full border-2',
            i < count ? 'border-accent bg-accent' : 'border-rule bg-cream'
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function LoyaltyManager({ programs, analytics, orgId, isAdmin }: LoyaltyManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<LoyaltyProgramInput>({
    resolver: zodResolver(loyaltyProgramSchema),
    defaultValues: {
      stamps_required: 8,
      reward_type: 'free_item',
      expiration_days: 90,
    },
  });

  const rewardType = watch('reward_type');

  function onSubmit(data: LoyaltyProgramInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await createLoyaltyProgram(orgId, data);
      if (result.success) {
        reset();
        setShowForm(false);
        router.refresh();
      } else {
        setServerError(result.error ?? 'Error al crear el programa');
      }
    });
  }

  function handleToggle(id: string, active: boolean) {
    startTransition(async () => {
      await toggleLoyaltyProgram(id, active);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setShowForm((s) => !s)}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Nuevo programa
          </Button>
        </div>
      )}

      {/* Create form */}
      {showForm && isAdmin && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border-2 border-accent bg-card p-4 space-y-3"
          aria-label="Nuevo programa de fidelidad"
        >
          <p className="font-sans font-medium text-ink">Nuevo programa de fidelidad</p>

          {serverError && (
            <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="prog-name" className="mb-1 block text-xs font-medium text-muted">Nombre del programa</label>
              <input
                id="prog-name"
                type="text"
                placeholder="Ej: Tarjeta de sellos"
                {...register('name')}
                className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-sans placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.name && <p role="alert" className="mt-0.5 text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="prog-stamps" className="mb-1 block text-xs font-medium text-muted">
                Sellos requeridos (5–12)
              </label>
              <input
                id="prog-stamps"
                type="number"
                min={5}
                max={12}
                {...register('stamps_required', { valueAsNumber: true })}
                className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.stamps_required && <p role="alert" className="mt-0.5 text-xs text-destructive">{errors.stamps_required.message}</p>}
            </div>

            <div>
              <label htmlFor="prog-expiry" className="mb-1 block text-xs font-medium text-muted">
                Expiración (días, 0 = sin expiración)
              </label>
              <input
                id="prog-expiry"
                type="number"
                min={0}
                {...register('expiration_days', { valueAsNumber: true })}
                className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label htmlFor="prog-reward-type" className="mb-1 block text-xs font-medium text-muted">Tipo de recompensa</label>
              <select
                id="prog-reward-type"
                {...register('reward_type')}
                className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="free_item">Producto gratis</option>
                <option value="discount">Descuento</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            <div>
              <label htmlFor="prog-reward-value" className="mb-1 block text-xs font-medium text-muted">
                {rewardType === 'discount' ? 'Porcentaje de descuento' : 'Descripción de la recompensa'}
              </label>
              <input
                id="prog-reward-value"
                type="text"
                placeholder={rewardType === 'discount' ? '20%' : 'Café americano gratis'}
                {...register('reward_value')}
                className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-sans placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.reward_value && <p role="alert" className="mt-0.5 text-xs text-destructive">{errors.reward_value.message}</p>}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); reset(); }}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Creando...' : 'Crear programa'}
            </Button>
          </div>
        </form>
      )}

      {/* Programs list */}
      {programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-rule py-20 text-center">
          <Gift className="mb-3 h-8 w-8 text-muted" aria-hidden="true" />
          <p className="font-display text-base font-medium text-ink">Sin programas de fidelidad</p>
          <p className="mt-1 text-sm font-sans text-muted max-w-xs">
            Crea un programa de sellos para premiar a tus clientes frecuentes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {programs.map((program) => {
            const stats = analytics[program.id] ?? { total: 0, completed: 0 };
            const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

            return (
              <div
                key={program.id}
                className={cn(
                  'rounded-xl border border-rule bg-card p-4',
                  !program.is_active && 'opacity-60'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-sans font-medium text-ink">{program.name}</p>
                      <Badge variant={program.is_active ? 'available' : 'outline'} className="shrink-0">
                        {program.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs font-sans text-muted">
                      {REWARD_TYPE_LABELS[program.reward_type]}: {program.reward_value}
                    </p>
                  </div>

                  {isAdmin && (
                    <Switch
                      checked={program.is_active}
                      onCheckedChange={(v) => handleToggle(program.id, v)}
                      aria-label={program.is_active ? 'Desactivar programa' : 'Activar programa'}
                      disabled={isPending}
                    />
                  )}
                </div>

                {/* Stamp dots preview */}
                <div className="mt-3">
                  <StampDots count={0} required={program.stamps_required} />
                  <p className="mt-1.5 text-xs font-mono text-muted">
                    {program.stamps_required} sellos para completar
                    {program.expiration_days ? ` · Expira en ${program.expiration_days} días` : ''}
                  </p>
                </div>

                {/* Analytics */}
                <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-rule bg-cream p-3">
                  <div className="text-center">
                    <p className="font-display text-lg font-bold text-ink">{stats.total}</p>
                    <p className="text-xs font-sans text-muted">Tarjetas</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-lg font-bold text-accent">{stats.completed}</p>
                    <p className="text-xs font-sans text-muted">Completadas</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-lg font-bold text-ink">{completionRate}%</p>
                    <p className="text-xs font-sans text-muted">Tasa</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
