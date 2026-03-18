'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Key, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Badge, Button, FormField, Input, Switch } from '@menuos/ui';
import { staffMemberSchema, type StaffMemberInput } from '@menuos/shared';
import type { Tables } from '@menuos/database';
import {
  createStaffMember,
  deleteStaffMember,
  regeneratePin,
  toggleStaffActive,
  updateStaffMember,
} from './actions';

type Staff = Tables<'staff_users'>;
type Branch = Pick<Tables<'branches'>, 'id' | 'name'>;

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super admin',
  manager: 'Gerente',
  waiter: 'Mesero',
  kitchen: 'Cocina',
};

const ROLE_VARIANT: Record<string, 'default' | 'info' | 'muted' | 'warning'> = {
  super_admin: 'default',
  manager: 'info',
  waiter: 'muted',
  kitchen: 'warning',
} as const;

function StaffForm({
  defaultValues,
  branches,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  defaultValues?: Partial<StaffMemberInput>;
  branches: Branch[];
  onSubmit: (data: StaffMemberInput) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffMemberInput>({
    resolver: zodResolver(staffMemberSchema),
    defaultValues: { role: 'waiter', branch_ids: [], ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <FormField label="Nombre" htmlFor="staff-name" error={errors.name?.message} required>
        <Input id="staff-name" autoFocus error={!!errors.name} {...register('name')} />
      </FormField>
      <FormField label="Email (opcional)" htmlFor="staff-email" error={errors.email?.message}>
        <Input id="staff-email" type="email" {...register('email')} />
      </FormField>
      <FormField label="Rol" htmlFor="staff-role" error={errors.role?.message} required>
        <select
          id="staff-role"
          className="w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          {...register('role')}
        >
          {Object.entries(ROLE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </FormField>
      {branches.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">Sucursales asignadas</legend>
          <div className="flex flex-wrap gap-3">
            {branches.map((b) => (
              <label key={b.id} className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  value={b.id}
                  className="accent-accent"
                  {...register('branch_ids')}
                />
                {b.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}
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

interface TeamManagerProps {
  members: Staff[];
  branches: Branch[];
  currentUserId: string;
}

export function TeamManager({ members, branches, currentUserId }: TeamManagerProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPin, setNewPin] = useState<{ name: string; pin: string } | null>(null);
  const [, startTransition] = useTransition();

  function handleCreate(data: StaffMemberInput) {
    startTransition(async () => {
      const result = await createStaffMember(data);
      if (result?.pin) {
        setNewPin({ name: data.name, pin: result.pin });
        setShowCreate(false);
      }
    });
  }

  function handleUpdate(id: string, data: StaffMemberInput) {
    startTransition(async () => {
      await updateStaffMember(id, data);
      setEditingId(null);
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar a "${name}"?`)) return;
    startTransition(async () => { await deleteStaffMember(id); });
  }

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => { await toggleStaffActive(id, isActive); });
  }

  function handleRegenPin(id: string, name: string) {
    if (!confirm(`¿Regenerar PIN de "${name}"? El PIN anterior quedará inválido.`)) return;
    startTransition(async () => {
      const result = await regeneratePin(id);
      if (result?.pin) setNewPin({ name, pin: result.pin });
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{members.length} miembros</p>
        {!showCreate && (
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Nuevo miembro
          </Button>
        )}
      </div>

      {/* PIN reveal */}
      {newPin && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
          <p className="font-medium text-ink">PIN generado para {newPin.name}</p>
          <p className="mt-1 text-xs text-muted">Guarda este PIN — no volverá a mostrarse.</p>
          <p className="mt-3 font-mono text-4xl font-bold tracking-widest text-accent">
            {newPin.pin}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => setNewPin(null)}
          >
            Entendido
          </Button>
        </div>
      )}

      {showCreate && (
        <div className="rounded-xl border border-accent/30 bg-paper p-5">
          <h3 className="mb-4 font-semibold text-ink">Nuevo miembro</h3>
          <StaffForm
            branches={branches}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            isPending={false}
            submitLabel="Crear miembro"
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {members.map((member) => (
          <div key={member.id} className="rounded-xl border border-rule bg-paper p-5">
            {editingId === member.id ? (
              <>
                <h3 className="mb-4 font-semibold text-ink">Editar {member.name}</h3>
                <StaffForm
                  defaultValues={{
                    name: member.name,
                    email: member.email ?? '',
                    role: member.role,
                    branch_ids: member.branch_ids,
                  }}
                  branches={branches}
                  onSubmit={(data) => handleUpdate(member.id, data)}
                  onCancel={() => setEditingId(null)}
                  isPending={false}
                  submitLabel="Guardar cambios"
                />
              </>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{member.name}</p>
                    <Badge variant={ROLE_VARIANT[member.role] ?? 'muted'}>
                      {ROLE_LABELS[member.role] ?? member.role}
                    </Badge>
                    {!member.is_active && <Badge variant="muted">Inactivo</Badge>}
                  </div>
                  {member.email && (
                    <p className="mt-0.5 text-xs text-muted">{member.email}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {member.id !== currentUserId && (
                    <Switch
                      checked={member.is_active}
                      onCheckedChange={(v: boolean) => handleToggle(member.id, v)}
                      aria-label={`${member.is_active ? 'Desactivar' : 'Activar'} ${member.name}`}
                    />
                  )}
                  <button
                    onClick={() => handleRegenPin(member.id, member.name)}
                    className="rounded p-1.5 text-muted hover:bg-cream hover:text-ink"
                    aria-label={`Regenerar PIN de ${member.name}`}
                  >
                    <Key className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(member.id)}
                    className="rounded p-1.5 text-muted hover:bg-cream hover:text-ink"
                    aria-label={`Editar ${member.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {member.id !== currentUserId && (
                    <button
                      onClick={() => handleDelete(member.id, member.name)}
                      className="rounded p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
                      aria-label={`Eliminar ${member.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
