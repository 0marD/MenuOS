'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Badge, Button, FormField, Input, Switch } from '@menuos/ui';
import { branchSchema, type BranchInput } from '@menuos/shared';
import type { Tables } from '@menuos/database';
import { createBranch, deleteBranch, toggleBranchActive, updateBranch } from './actions';

const TIMEZONES = [
  'America/Mexico_City',
  'America/Cancun',
  'America/Monterrey',
  'America/Chihuahua',
  'America/Hermosillo',
  'America/Mazatlan',
  'America/Tijuana',
];

interface BranchManagerProps {
  branches: Tables<'branches'>[];
}

function BranchForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  defaultValues?: Partial<BranchInput>;
  onSubmit: (data: BranchInput) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BranchInput>({
    resolver: zodResolver(branchSchema),
    defaultValues: { timezone: 'America/Mexico_City', ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <FormField label="Nombre" htmlFor="branch-name" error={errors.name?.message} required>
        <Input id="branch-name" autoFocus error={!!errors.name} {...register('name')} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Dirección" htmlFor="branch-addr" error={errors.address?.message}>
          <Input id="branch-addr" {...register('address')} />
        </FormField>
        <FormField label="Teléfono" htmlFor="branch-phone" error={errors.phone?.message}>
          <Input id="branch-phone" type="tel" {...register('phone')} />
        </FormField>
      </div>
      <FormField label="Zona horaria" htmlFor="branch-tz" error={errors.timezone?.message}>
        <select
          id="branch-tz"
          className="w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          {...register('timezone')}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </FormField>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function BranchManager({ branches }: BranchManagerProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleCreate(data: BranchInput) {
    startTransition(async () => {
      await createBranch(data);
      setShowCreate(false);
    });
  }

  function handleUpdate(id: string, data: BranchInput) {
    startTransition(async () => {
      await updateBranch(id, data);
      setEditingId(null);
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la sucursal "${name}"?`)) return;
    startTransition(async () => { await deleteBranch(id); });
  }

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => { await toggleBranchActive(id, isActive); });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{branches.length} sucursales</p>
        {!showCreate && (
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Nueva sucursal
          </Button>
        )}
      </div>

      {showCreate && (
        <div className="rounded-xl border border-accent/30 bg-paper p-5">
          <h3 className="mb-4 font-semibold text-ink">Nueva sucursal</h3>
          <BranchForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            isPending={false}
            submitLabel="Crear sucursal"
          />
        </div>
      )}

      {branches.length === 0 && !showCreate ? (
        <p className="py-8 text-center text-sm text-muted">No hay sucursales registradas.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {branches.map((branch) => (
            <div key={branch.id} className="rounded-xl border border-rule bg-paper p-5">
              {editingId === branch.id ? (
                <>
                  <h3 className="mb-4 font-semibold text-ink">Editar {branch.name}</h3>
                  <BranchForm
                    defaultValues={{
                      name: branch.name,
                      address: branch.address ?? '',
                      phone: branch.phone ?? '',
                      timezone: branch.timezone,
                    }}
                    onSubmit={(data) => handleUpdate(branch.id, data)}
                    onCancel={() => setEditingId(null)}
                    isPending={false}
                    submitLabel="Guardar cambios"
                  />
                </>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink">{branch.name}</p>
                      <Badge variant={branch.is_active ? 'success' : 'muted'}>
                        {branch.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                    {branch.address && <p className="mt-0.5 text-xs text-muted">{branch.address}</p>}
                    <p className="mt-0.5 font-mono text-xs text-muted">{branch.timezone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={branch.is_active}
                      onCheckedChange={(v) => handleToggle(branch.id, v)}
                      aria-label={`${branch.is_active ? 'Desactivar' : 'Activar'} ${branch.name}`}
                    />
                    <button
                      onClick={() => setEditingId(branch.id)}
                      className="rounded p-1.5 text-muted hover:bg-cream hover:text-ink"
                      aria-label={`Editar ${branch.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(branch.id, branch.name)}
                      className="rounded p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
                      aria-label={`Eliminar ${branch.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
