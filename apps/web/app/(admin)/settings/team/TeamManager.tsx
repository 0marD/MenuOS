'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Button } from '@menuos/ui/atoms/Button';
import { Badge } from '@menuos/ui/atoms/Badge';
import { Switch } from '@menuos/ui/atoms/Switch';
import { cn } from '@menuos/ui';
import { staffUserSchema, type StaffUserInput } from '@menuos/shared/validations';
import { createStaffMember, deleteStaffMember, toggleStaffActive, regeneratePin } from './actions';

interface Member {
  id: string;
  name: string;
  email: string | null;
  role: string;
  branch_id: string | null;
  is_active: boolean;
  created_at: string;
}

interface Branch {
  id: string;
  name: string;
}

interface TeamManagerProps {
  members: Member[];
  branches: Branch[];
  orgId: string;
  currentUserId: string;
  isAdmin: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  manager: 'Manager',
  waiter: 'Mesero',
  kitchen: 'Cocina',
};

const ROLE_VARIANTS: Record<string, 'default' | 'secondary' | 'outline'> = {
  super_admin: 'default',
  manager: 'secondary',
  waiter: 'outline',
  kitchen: 'outline',
};

export function TeamManager({ members, branches, orgId, currentUserId, isAdmin }: TeamManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [newPin, setNewPin] = useState<{ memberId: string; pin: string } | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<StaffUserInput>({
    resolver: zodResolver(staffUserSchema),
    defaultValues: { role: 'waiter' },
  });

  const selectedRole = watch('role');
  const needsPin = selectedRole === 'waiter' || selectedRole === 'kitchen';

  function onSubmit(data: StaffUserInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await createStaffMember(orgId, data);
      if (result.success) {
        if (result.pin) setNewPin({ memberId: result.id!, pin: result.pin });
        reset();
        setShowForm(false);
        router.refresh();
      } else {
        setServerError(result.error ?? 'Error al crear el miembro');
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteStaffMember(id);
      router.refresh();
    });
  }

  function handleToggleActive(id: string, active: boolean) {
    startTransition(async () => {
      await toggleStaffActive(id, active);
      router.refresh();
    });
  }

  function handleRegeneratePin(id: string) {
    startTransition(async () => {
      const result = await regeneratePin(id);
      if (result.pin) {
        setNewPin({ memberId: id, pin: result.pin });
        setShowPin(true);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* PIN reveal modal */}
      {newPin && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pin-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50"
        >
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-paper p-6 shadow-2xl">
            <p id="pin-dialog-title" className="font-display text-xl font-bold text-ink text-center">
              PIN generado
            </p>
            <p className="mt-1 text-sm font-sans text-muted text-center">
              Anota este PIN — no se mostrará de nuevo.
            </p>
            <div className="my-6 flex items-center justify-center gap-2">
              <p className="font-mono text-4xl font-bold tracking-widest text-accent">
                {showPin ? newPin.pin : '••••'}
              </p>
              <button
                onClick={() => setShowPin((s) => !s)}
                aria-label={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                className="text-muted"
              >
                {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <Button
              className="w-full"
              onClick={() => { setNewPin(null); setShowPin(false); }}
            >
              Entendido, ya lo anoté
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-sans text-muted">
          {members.length} miembro{members.length !== 1 ? 's' : ''}
        </p>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowForm((s) => !s)}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Agregar
          </Button>
        )}
      </div>

      {/* Add form */}
      {showForm && isAdmin && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border border-accent border-2 bg-card p-4 space-y-3"
          aria-label="Nuevo miembro del equipo"
        >
          <p className="font-sans font-medium text-ink">Nuevo miembro</p>

          {serverError && (
            <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="staff-name" className="mb-1 block text-xs font-medium text-muted">Nombre</label>
              <input
                id="staff-name"
                type="text"
                placeholder="Nombre completo"
                {...register('name')}
                className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-sans placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.name && <p role="alert" className="mt-0.5 text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="staff-role" className="mb-1 block text-xs font-medium text-muted">Rol</label>
              <select
                id="staff-role"
                {...register('role')}
                className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="manager">Manager</option>
                <option value="waiter">Mesero</option>
                <option value="kitchen">Cocina</option>
              </select>
            </div>

            {!needsPin && (
              <div className="sm:col-span-2">
                <label htmlFor="staff-email" className="mb-1 block text-xs font-medium text-muted">Email (para admin/manager)</label>
                <input
                  id="staff-email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  {...register('email')}
                  className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-sans placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {errors.email && <p role="alert" className="mt-0.5 text-xs text-destructive">{errors.email.message}</p>}
              </div>
            )}

            {needsPin && branches.length > 0 && (
              <div className="sm:col-span-2">
                <label htmlFor="staff-branch" className="mb-1 block text-xs font-medium text-muted">Sucursal</label>
                <select
                  id="staff-branch"
                  {...register('branch_id')}
                  className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Sin sucursal asignada</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {needsPin && (
            <p className="text-xs font-sans text-muted bg-cream rounded-lg px-3 py-2">
              Se generará un PIN de 4 dígitos automáticamente. Cópialo cuando aparezca.
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); reset(); }}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Creando...' : 'Crear miembro'}
            </Button>
          </div>
        </form>
      )}

      {/* Members list */}
      <div className="overflow-hidden rounded-xl border border-rule">
        {members.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-sans text-muted">No hay miembros aún.</p>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-rule">
            {members.map((member) => {
              const isSelf = member.id === currentUserId;
              const hasPin = member.role === 'waiter' || member.role === 'kitchen';

              return (
                <li key={member.id} className={cn('flex items-center gap-3 bg-card px-4 py-3', !member.is_active && 'opacity-50')}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-medium text-ink truncate">{member.name}</span>
                      {isSelf && <span className="text-xs font-mono text-muted">(tú)</span>}
                      <Badge variant={ROLE_VARIANTS[member.role] ?? 'outline'} className="shrink-0">
                        {ROLE_LABELS[member.role] ?? member.role}
                      </Badge>
                    </div>
                    {member.email && (
                      <p className="text-xs font-sans text-muted mt-0.5">{member.email}</p>
                    )}
                  </div>

                  {isAdmin && !isSelf && (
                    <div className="flex items-center gap-1 shrink-0">
                      {hasPin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleRegeneratePin(member.id)}
                          disabled={isPending}
                          aria-label="Regenerar PIN"
                          title="Regenerar PIN"
                        >
                          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      )}
                      <Switch
                        checked={member.is_active}
                        onCheckedChange={(v) => handleToggleActive(member.id, v)}
                        aria-label={member.is_active ? 'Desactivar miembro' : 'Activar miembro'}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(member.id)}
                        disabled={isPending}
                        aria-label="Eliminar miembro"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
