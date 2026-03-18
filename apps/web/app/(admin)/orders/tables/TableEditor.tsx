'use client';

import { Download, Plus, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import QRCode from 'react-qr-code';
import { Badge, Button, Switch } from '@menuos/ui';
import type { Tables } from '@menuos/database';
import { createTable, deleteTable, toggleTableActive } from './actions';

type Table = Tables<'restaurant_tables'>;
type Branch = Pick<Tables<'branches'>, 'id' | 'name'>;

interface TableEditorProps {
  tables: Table[];
  branches: Branch[];
  baseUrl: string;
  orgSlug: string;
}

export function TableEditor({ tables, branches, baseUrl, orgSlug }: TableEditorProps) {
  const [selectedBranch, setSelectedBranch] = useState(branches[0]?.id ?? '');
  const [newName, setNewName] = useState('');
  const [newZone, setNewZone] = useState('');
  const [, startTransition] = useTransition();

  const filtered = tables.filter((t) => t.branch_id === selectedBranch);

  function handleCreate() {
    if (!newName.trim()) return;
    startTransition(async () => {
      await createTable(selectedBranch, newName.trim(), newZone.trim());
      setNewName('');
      setNewZone('');
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la mesa "${name}"?`)) return;
    startTransition(async () => { await deleteTable(id); });
  }

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => { await toggleTableActive(id, isActive); });
  }

  function downloadQr(table: Table) {
    const svgEl = document.getElementById(`qr-${table.id}`)?.querySelector('svg');
    if (!svgEl) return;

    const SIZE = 400;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE + 40;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, SIZE, SIZE + 40);
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      ctx.fillStyle = '#0F0E0C';
      ctx.font = 'bold 16px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(table.name, SIZE / 2, SIZE + 26);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `qr-mesa-${table.name.replace(/\s/g, '-')}.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(svgUrl);
      });
    };
    img.src = svgUrl;
  }

  function downloadAll() {
    filtered.forEach((t, i) => setTimeout(() => downloadQr(t), i * 300));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Branch selector */}
      {branches.length > 1 && (
        <div className="flex gap-2">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBranch(b.id)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                b.id === selectedBranch
                  ? 'bg-accent/10 text-accent'
                  : 'bg-cream text-muted hover:bg-rule'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {/* Create form */}
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre de la mesa"
          className="flex-1 rounded border border-rule bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          aria-label="Nombre de la mesa"
        />
        <input
          value={newZone}
          onChange={(e) => setNewZone(e.target.value)}
          placeholder="Zona (opcional)"
          className="w-32 rounded border border-rule bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Zona"
        />
        <Button onClick={handleCreate} disabled={!newName.trim()} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </div>

      {filtered.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={downloadAll} className="gap-1.5">
            <Download className="h-4 w-4" />
            Descargar todos los QR
          </Button>
        </div>
      )}

      {/* Tables grid */}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No hay mesas en esta sucursal.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((table) => {
            const qrUrl = `${baseUrl}/${orgSlug}?table=${table.qr_token}`;
            return (
              <div key={table.id} className="rounded-xl border border-rule bg-paper p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-ink">{table.name}</p>
                    {table.zone && <p className="text-xs text-muted">{table.zone}</p>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={table.is_active ? 'success' : 'muted'}>
                      {table.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                    <Switch
                      checked={table.is_active}
                      onCheckedChange={(v) => handleToggle(table.id, v)}
                      aria-label={`${table.is_active ? 'Desactivar' : 'Activar'} ${table.name}`}
                    />
                  </div>
                </div>

                <div
                  id={`qr-${table.id}`}
                  className="flex items-center justify-center rounded bg-white p-3"
                >
                  <QRCode value={qrUrl} size={120} level="M" />
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => downloadQr(table)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar QR
                  </Button>
                  <button
                    onClick={() => handleDelete(table.id, table.name)}
                    className="rounded p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
                    aria-label={`Eliminar ${table.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
