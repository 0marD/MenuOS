'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Badge, Button, FormField, Input, Switch } from '@menuos/ui';
import { loyaltyProgramSchema, type LoyaltyProgramInput } from '@menuos/shared';
import type { Tables } from '@menuos/database';
import { createLoyaltyProgram, toggleLoyaltyProgram } from './actions';

type Program = Tables<'loyalty_programs'> & {
  _count?: { stamp_cards: number };
};

interface LoyaltyManagerProps {
  programs: Program[];
  totalCards: number;
  totalStamps: number;
}

export function LoyaltyManager({ programs, totalCards, totalStamps }: LoyaltyManagerProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<LoyaltyProgramInput>({
    resolver: zodResolver(loyaltyProgramSchema),
    defaultValues: { stamps_required: 8, reward_type: 'free_item' },
  });

  function onSubmit(data: LoyaltyProgramInput) {
    startTransition(async () => {
      const result = await createLoyaltyProgram(data);
      if (result?.error) {
        setError('root', { message: result.error });
        return;
      }
      reset();
      setShowCreate(false);
    });
  }

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => { await toggleLoyaltyProgram(id, isActive); });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Programas', value: programs.length },
          { label: 'Tarjetas activas', value: totalCards },
          { label: 'Sellos emitidos', value: totalStamps },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-rule bg-paper p-4 text-center">
            <p className="font-display text-2xl font-bold text-ink">{m.value}</p>
            <p className="mt-0.5 text-xs text-muted">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-ink">Programas</h2>
        {!showCreate && (
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Nuevo programa
          </Button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border border-accent/30 bg-paper p-5 flex flex-col gap-4"
          noValidate
        >
          <h3 className="font-semibold text-ink">Nuevo programa de sellos</h3>

          <FormField label="Nombre" htmlFor="lp-name" error={errors.name?.message} required>
            <Input id="lp-name" autoFocus error={!!errors.name} {...register('name')} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Sellos requeridos"
              htmlFor="lp-stamps"
              error={errors.stamps_required?.message}
              required
            >
              <Input
                id="lp-stamps"
                type="number"
                min="3"
                max="20"
                error={!!errors.stamps_required}
                {...register('stamps_required', { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              label="Tipo de recompensa"
              htmlFor="lp-type"
              error={errors.reward_type?.message}
            >
              <select
                id="lp-type"
                className="w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                {...register('reward_type')}
              >
                <option value="free_item">Platillo gratis</option>
                <option value="discount">Descuento</option>
                <option value="free_drink">Bebida gratis</option>
              </select>
            </FormField>
          </div>

          <FormField
            label="Descripción de la recompensa"
            htmlFor="lp-reward"
            error={errors.reward_description?.message}
            required
          >
            <Input
              id="lp-reward"
              placeholder="Ej. Postre gratis a elección"
              error={!!errors.reward_description}
              {...register('reward_description')}
            />
          </FormField>

          <FormField
            label="Expiración de sellos (días, opcional)"
            htmlFor="lp-expiry"
            error={errors.stamps_expiry_days?.message}
            hint="Deja vacío para que nunca expiren"
          >
            <Input
              id="lp-expiry"
              type="number"
              min="1"
              {...register('stamps_expiry_days', { valueAsNumber: true })}
            />
          </FormField>

          {errors.root && (
            <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
              {errors.root.message}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear programa</Button>
          </div>
        </form>
      )}

      {/* Programs list */}
      {programs.length === 0 && !showCreate ? (
        <p className="py-8 text-center text-sm text-muted">
          No hay programas de fidelización creados.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {programs.map((p) => (
            <div key={p.id} className="rounded-xl border border-rule bg-paper px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{p.name}</p>
                    <Badge variant={p.is_active ? 'success' : 'muted'}>
                      {p.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {p.stamps_required} sellos → {p.reward_description}
                  </p>
                  {p.stamps_expiry_days && (
                    <p className="mt-0.5 text-xs text-muted">
                      Sellos expiran en {p.stamps_expiry_days} días
                    </p>
                  )}
                </div>
                <Switch
                  checked={p.is_active}
                  onCheckedChange={(v) => handleToggle(p.id, v)}
                  aria-label={`${p.is_active ? 'Desactivar' : 'Activar'} programa ${p.name}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
