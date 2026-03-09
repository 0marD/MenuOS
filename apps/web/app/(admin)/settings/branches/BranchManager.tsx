'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, MapPin, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@menuos/ui/atoms/Button';
import { Badge } from '@menuos/ui/atoms/Badge';
import { Switch } from '@menuos/ui/atoms/Switch';
import { cn } from '@menuos/ui';
import { branchSchema, type BranchInput } from '@menuos/shared/validations';
import { createBranch, updateBranch, deleteBranch, toggleBranchActive } from './actions';

interface Branch {
  id: string;
  name: string;
  address: string | null;
  timezone: string;
  is_active: boolean;
  is_temporarily_closed: boolean;
  created_at: string;
}

interface BranchManagerProps {
  branches: Branch[];
  orgId: string;
  isAdmin: boolean;
}

const MX_TIMEZONES = [
  { value: 'America/Mexico_City', label: 'Ciudad de México (CST)' },
  { value: 'America/Monterrey', label: 'Monterrey (CST)' },
  { value: 'America/Tijuana', label: 'Tijuana (PST)' },
  { value: 'America/Chihuahua', label: 'Chihuahua (MST)' },
  { value: 'America/Cancun', label: 'Cancún (EST)' },
] as const;

type FormMode = { kind: 'create' } | { kind: 'edit'; branch: Branch };

export function BranchManager({ branches, orgId, isAdmin }: BranchManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchInput>({
    resolver: zodResolver(branchSchema),
    defaultValues: { timezone: 'America/Mexico_City', is_active: true },
  });

  function openCreate() {
    reset({ timezone: 'America/Mexico_City', is_active: true });
    setFormMode({ kind: 'create' });
    setServerError(null);
  }

  function openEdit(branch: Branch) {
    reset({
      name: branch.name,
      address: branch.address ?? undefined,
      timezone: branch.timezone,
      is_active: branch.is_active,
    });
    setFormMode({ kind: 'edit', branch });
    setServerError(null);
  }

  function closeForm() {
    setFormMode(null);
    reset();
    setServerError(null);
  }

  function onSubmit(data: BranchInput) {
    setServerError(null);
    startTransition(async () => {
      const result =
        formMode?.kind === 'edit'
          ? await updateBranch(formMode.branch.id, data)
          : await createBranch(orgId, data);

      if (result.success) {
        closeForm();
        router.refresh();
      } else {
        setServerError(result.error ?? 'Error al guardar la sucursal');
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta sucursal? Esta acción no se puede deshacer.')) return;
    startTransition(async () => {
      await deleteBranch(id);
      router.refresh();
    });
  }

  function handleToggle(id: string, active: boolean) {
    startTransition(async () => {
      await toggleBranchActive(id, active);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Nueva sucursal
          </Button>
        </div>
      )}

      {/* Form */}
      {formMode && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border-2 border-accent bg-card p-4 space-y-3"
          aria-label={formMode.kind === 'create' ? 'Nueva sucursal' : 'Editar sucursal'}
        >
          <p className="font-sans font-medium text-ink">
            {formMode.kind === 'create' ? 'Nueva sucursal' : 'Editar sucursal'}
          </p>

          {serverError && (
            <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="branch-name" className="mb-1 block text-xs font-medium text-muted">
                Nombre *
              </label>
              <input
                id="branch-name"
                type="text"
                placeholder="Ej: Sucursal Centro"
                {...register('name')}
                className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-sans placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.name && (
                <p role="alert" className="mt-0.5 text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="branch-address" className="mb-1 block text-xs font-medium text-muted">
                Dirección
              </label>
              <input
                id="branch-address"
                type="text"
                placeholder="Av. Juárez 123, Centro..."
                {...register('address')}
                className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-sans placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.address && (
                <p role="alert" className="mt-0.5 text-xs text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="branch-timezone" className="mb-1 block text-xs font-medium text-muted">
                Zona horaria
              </label>
              <select
                id="branch-timezone"
                {...register('timezone')}
                className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {MX_TIMEZONES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={closeForm}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Guardando...' : formMode.kind === 'create' ? 'Crear sucursal' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      )}

      {/* Branch list */}
      {branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-rule py-16 text-center">
          <MapPin className="mb-3 h-8 w-8 text-muted" aria-hidden="true" />
          <p className="text-sm font-sans font-medium text-ink">Sin sucursales</p>
          <p className="mt-1 text-xs font-sans text-muted">Crea tu primera sucursal para comenzar.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-rule">
          <ul role="list" className="divide-y divide-rule">
            {branches.map((branch) => (
              <li key={branch.id} className={cn('bg-card px-4 py-3', !branch.is_active && 'opacity-60')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-sans font-medium text-ink truncate">{branch.name}</p>
                      {!branch.is_active && (
                        <Badge variant="outline" className="shrink-0 text-xs">Inactiva</Badge>
                      )}
                      {branch.is_temporarily_closed && branch.is_active && (
                        <Badge variant="highlight" className="shrink-0 text-xs">Cerrada temp.</Badge>
                      )}
                    </div>
                    {branch.address && (
                      <p className="mt-0.5 text-xs font-sans text-muted truncate">{branch.address}</p>
                    )}
                    <p className="text-xs font-mono text-muted/70">
                      {MX_TIMEZONES.find((t) => t.value === branch.timezone)?.label ?? branch.timezone}
                    </p>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Switch
                        checked={branch.is_active}
                        onCheckedChange={(v) => handleToggle(branch.id, v)}
                        aria-label={branch.is_active ? 'Desactivar sucursal' : 'Activar sucursal'}
                        disabled={isPending}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(branch)}
                        aria-label="Editar sucursal"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(branch.id)}
                        disabled={isPending}
                        aria-label="Eliminar sucursal"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
