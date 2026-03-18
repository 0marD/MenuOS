'use client';

import { useState, useTransition } from 'react';
import { Button, Switch } from '@menuos/ui';
import type { Tables } from '@menuos/database';
import { toggleBranchTemporaryClosed, upsertSchedules } from './actions';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

type Branch = Tables<'branches'>;
type Schedule = Tables<'branch_schedules'>;

function defaultSchedules(branchId: string, existing: Schedule[]): ScheduleRow[] {
  return DAYS.map((_, day) => {
    const found = existing.find((s) => s.branch_id === branchId && s.day_of_week === day);
    return {
      day_of_week: day,
      opens_at: found?.opens_at ?? '09:00',
      closes_at: found?.closes_at ?? '21:00',
      is_closed: found?.is_closed ?? day === 0,
    };
  });
}

interface ScheduleRow {
  day_of_week: number;
  opens_at: string;
  closes_at: string;
  is_closed: boolean;
}

interface ScheduleManagerProps {
  branches: Branch[];
  schedulesByBranch: Record<string, Schedule[]>;
}

export function ScheduleManager({ branches, schedulesByBranch }: ScheduleManagerProps) {
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id ?? '');
  const [isPending, startTransition] = useTransition();

  const branch = branches.find((b) => b.id === selectedBranchId);
  const [rows, setRows] = useState<ScheduleRow[]>(() =>
    defaultSchedules(selectedBranchId, schedulesByBranch[selectedBranchId] ?? []),
  );

  function handleBranchChange(id: string) {
    setSelectedBranchId(id);
    setRows(defaultSchedules(id, schedulesByBranch[id] ?? []));
  }

  function updateRow(day: number, field: keyof ScheduleRow, value: string | boolean) {
    setRows((prev) =>
      prev.map((r) => (r.day_of_week === day ? { ...r, [field]: value } : r)),
    );
  }

  function handleSave() {
    startTransition(async () => { await upsertSchedules(selectedBranchId, rows); });
  }

  function handleToggleClosed(isClosed: boolean) {
    startTransition(async () => { await toggleBranchTemporaryClosed(selectedBranchId, isClosed); });
  }

  if (!branch) return <p className="text-sm text-muted">No hay sucursales configuradas.</p>;

  return (
    <div className="flex flex-col gap-6">
      {/* Branch selector */}
      {branches.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => handleBranchChange(b.id)}
              className={`shrink-0 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                b.id === selectedBranchId
                  ? 'bg-accent/10 text-accent'
                  : 'bg-cream text-muted hover:bg-rule'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {/* Temp closed toggle */}
      <div className="flex items-center justify-between rounded-xl border border-rule bg-paper px-5 py-4">
        <div>
          <p className="font-medium text-ink">Cerrado temporalmente</p>
          <p className="text-xs text-muted">Muestra &quot;cerrado hoy&quot; en el menú del cliente</p>
        </div>
        <Switch
          checked={branch.is_temporarily_closed}
          onCheckedChange={handleToggleClosed}
          aria-label="Cerrado temporalmente"
        />
      </div>

      {/* Weekly schedule */}
      <div className="overflow-hidden rounded-xl border border-rule bg-paper">
        <div className="border-b border-rule px-5 py-3">
          <p className="font-display text-sm font-semibold text-ink">Horario semanal</p>
        </div>
        <div className="divide-y divide-rule">
          {rows.map((row) => (
            <div key={row.day_of_week} className="flex items-center gap-4 px-5 py-3">
              <span className="w-24 shrink-0 text-sm font-medium text-ink">
                {DAYS[row.day_of_week]}
              </span>
              <Switch
                checked={!row.is_closed}
                onCheckedChange={(v) => updateRow(row.day_of_week, 'is_closed', !v)}
                aria-label={`${DAYS[row.day_of_week]} abierto`}
              />
              {!row.is_closed ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="time"
                    value={row.opens_at}
                    onChange={(e) => updateRow(row.day_of_week, 'opens_at', e.target.value)}
                    className="rounded border border-rule bg-paper px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                    aria-label={`Apertura ${DAYS[row.day_of_week]}`}
                  />
                  <span className="text-xs text-muted">–</span>
                  <input
                    type="time"
                    value={row.closes_at}
                    onChange={(e) => updateRow(row.day_of_week, 'closes_at', e.target.value)}
                    className="rounded border border-rule bg-paper px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                    aria-label={`Cierre ${DAYS[row.day_of_week]}`}
                  />
                </div>
              ) : (
                <span className="flex-1 text-sm text-muted">Cerrado</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar horarios'}
        </Button>
      </div>
    </div>
  );
}
