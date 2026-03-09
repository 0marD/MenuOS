'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, QrCode, Pencil, Trash2, Download } from 'lucide-react';
import { Button } from '@menuos/ui/atoms/Button';
import { Badge } from '@menuos/ui/atoms/Badge';
import { Switch } from '@menuos/ui/atoms/Switch';
import { cn } from '@menuos/ui';
import { createTable, updateTable, deleteTable, toggleTableActive } from './actions';

interface Table {
  id: string;
  branch_id: string;
  number: number;
  label: string | null;
  zone: string | null;
  capacity: number | null;
  is_active: boolean;
  qr_token: string | null;
}

interface Branch {
  id: string;
  name: string;
}

interface TableEditorProps {
  branches: Branch[];
  tables: Table[];
  orgId: string;
  orgSlug: string;
}

const ZONES = ['interior', 'terraza', 'barra', 'privado'] as const;

const APP_DOMAIN = process.env['NEXT_PUBLIC_APP_DOMAIN'] ?? 'menuos.mx';

type FormMode = { kind: 'create' } | { kind: 'edit'; table: Table };

export function TableEditor({ branches, tables, orgId, orgSlug }: TableEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [activeBranch, setActiveBranch] = useState<string>(branches[0]?.id ?? '');
  const [serverError, setServerError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({ number: '', label: '', zone: '', capacity: '4', branch_id: '' });

  const branchTables = tables.filter((t) => t.branch_id === activeBranch);

  function openCreate() {
    setForm({ number: String(branchTables.length + 1), label: '', zone: '', capacity: '4', branch_id: activeBranch });
    setFormMode({ kind: 'create' });
    setServerError(null);
  }

  function openEdit(table: Table) {
    setForm({
      number: String(table.number),
      label: table.label ?? '',
      zone: table.zone ?? '',
      capacity: String(table.capacity ?? 4),
      branch_id: table.branch_id,
    });
    setFormMode({ kind: 'edit', table });
    setServerError(null);
  }

  function closeForm() {
    setFormMode(null);
    setServerError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    startTransition(async () => {
      const data = {
        number: Number(form.number),
        label: form.label.trim() || null,
        zone: form.zone || null,
        capacity: Number(form.capacity) || 4,
      };
      const result = formMode?.kind === 'edit'
        ? await updateTable(formMode.table.id, data)
        : await createTable(orgId, activeBranch, data);

      if (result.success) {
        closeForm();
        router.refresh();
      } else {
        setServerError(result.error ?? 'Error al guardar la mesa');
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta mesa?')) return;
    startTransition(async () => {
      await deleteTable(id);
      router.refresh();
    });
  }

  function handleToggle(id: string, active: boolean) {
    startTransition(async () => {
      await toggleTableActive(id, active);
      router.refresh();
    });
  }

  function downloadQr(table: Table) {
    if (!table.qr_token) return;
    const url = `https://${APP_DOMAIN}/${orgSlug}?table=${table.qr_token}`;
    // Open QR generator in new tab with the URL pre-filled
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `mesa-${table.number}-qr.png`;
    a.target = '_blank';
    a.click();
  }

  function downloadAllQrs() {
    branchTables.forEach((t, i) => {
      setTimeout(() => downloadQr(t), i * 300);
    });
  }

  return (
    <div className="space-y-4">
      {/* Branch tabs */}
      {branches.length > 1 && (
        <div role="tablist" className="flex gap-1 rounded-lg border border-rule bg-cream p-1">
          {branches.map((b) => (
            <button
              key={b.id}
              role="tab"
              aria-selected={activeBranch === b.id}
              onClick={() => { setActiveBranch(b.id); closeForm(); }}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm font-sans transition-colors',
                activeBranch === b.id ? 'bg-paper font-medium text-ink shadow-sm' : 'text-muted hover:text-ink'
              )}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm font-sans text-muted">
          {branchTables.length} mesa{branchTables.length !== 1 ? 's' : ''} configuradas
        </p>
        <div className="flex gap-2">
          {branchTables.length > 0 && (
            <Button variant="outline" size="sm" onClick={downloadAllQrs}>
              <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Descargar QRs
            </Button>
          )}
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Nueva mesa
          </Button>
        </div>
      </div>

      {/* Form */}
      {formMode && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border-2 border-accent bg-card p-4 space-y-3"
          aria-label={formMode.kind === 'create' ? 'Nueva mesa' : 'Editar mesa'}
        >
          <p className="font-sans font-medium text-ink">
            {formMode.kind === 'create' ? 'Nueva mesa' : `Editar mesa ${formMode.kind === 'edit' ? formMode.table.number : ''}`}
          </p>

          {serverError && (
            <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label htmlFor="t-number" className="mb-1 block text-xs font-medium text-muted">Número *</label>
              <input
                id="t-number"
                type="number"
                min={1}
                required
                value={form.number}
                onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="t-capacity" className="mb-1 block text-xs font-medium text-muted">Capacidad</label>
              <input
                id="t-capacity"
                type="number"
                min={1}
                max={20}
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="t-zone" className="mb-1 block text-xs font-medium text-muted">Zona</label>
              <select
                id="t-zone"
                value={form.zone}
                onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))}
                className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Sin zona</option>
                {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="t-label" className="mb-1 block text-xs font-medium text-muted">Etiqueta</label>
              <input
                id="t-label"
                type="text"
                placeholder="Mesa 1"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-sans placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={closeForm}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Guardando...' : formMode.kind === 'create' ? 'Crear mesa' : 'Guardar'}
            </Button>
          </div>
        </form>
      )}

      {/* Tables grid */}
      {branchTables.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-rule py-16 text-center">
          <QrCode className="mb-3 h-8 w-8 text-muted" aria-hidden="true" />
          <p className="font-sans font-medium text-ink">Sin mesas configuradas</p>
          <p className="mt-1 text-xs font-sans text-muted">Crea mesas para generar QRs únicos por mesa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {branchTables.map((table) => (
            <div
              key={table.id}
              className={cn(
                'relative rounded-xl border p-3 transition-all',
                table.is_active ? 'border-rule bg-card' : 'border-rule/50 bg-card opacity-50'
              )}
            >
              {/* Number */}
              <p className="font-display text-3xl font-black text-ink">{table.number}</p>
              {table.zone && (
                <Badge variant="outline" className="mt-1 text-[10px]">{table.zone}</Badge>
              )}
              <p className="mt-1 text-xs font-mono text-muted">{table.capacity ?? 4} personas</p>

              {/* Actions */}
              <div className="mt-2 flex items-center gap-1">
                <Switch
                  checked={table.is_active}
                  onCheckedChange={(v) => handleToggle(table.id, v)}
                  aria-label={table.is_active ? 'Desactivar mesa' : 'Activar mesa'}
                  disabled={isPending}
                />
                <button
                  onClick={() => downloadQr(table)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-cream"
                  aria-label={`Descargar QR mesa ${table.number}`}
                >
                  <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => openEdit(table)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-cream"
                  aria-label={`Editar mesa ${table.number}`}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => handleDelete(table.id)}
                  disabled={isPending}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Eliminar mesa ${table.number}`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
