'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Switch } from '@menuos/ui/atoms/Switch';
import { Button } from '@menuos/ui/atoms/Button';
import { cn } from '@menuos/ui';
import { saveSchedules, toggleTemporarilyClosed } from './actions';

const DAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
] as const;

interface Schedule {
  id: string;
  branch_id: string;
  day_of_week: number;
  opens_at: string;
  closes_at: string;
  is_open: boolean;
}

interface Branch {
  id: string;
  name: string;
  is_temporarily_closed: boolean;
  closed_message: string | null;
}

interface DaySchedule {
  day_of_week: number;
  opens_at: string;
  closes_at: string;
  is_open: boolean;
}

interface ScheduleManagerProps {
  branches: Branch[];
  schedules: Schedule[];
  orgId: string;
}

const DEFAULT_OPENS = '09:00';
const DEFAULT_CLOSES = '22:00';

function buildDaySchedules(branchId: string, schedules: Schedule[]): DaySchedule[] {
  return DAYS.map(({ value }) => {
    const existing = schedules.find((s) => s.branch_id === branchId && s.day_of_week === value);
    return {
      day_of_week: value,
      opens_at: existing?.opens_at ?? DEFAULT_OPENS,
      closes_at: existing?.closes_at ?? DEFAULT_CLOSES,
      is_open: existing?.is_open ?? (value !== 0), // closed on Sunday by default
    };
  });
}

export function ScheduleManager({ branches, schedules, orgId }: ScheduleManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeBranch, setActiveBranch] = useState<string>(branches[0]?.id ?? '');
  const [daySchedules, setDaySchedules] = useState<Record<string, DaySchedule[]>>(() => {
    const map: Record<string, DaySchedule[]> = {};
    for (const branch of branches) {
      map[branch.id] = buildDaySchedules(branch.id, schedules);
    }
    return map;
  });
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  if (branches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-rule py-16 text-center">
        <p className="text-sm font-sans text-muted">
          Primero crea una sucursal para configurar sus horarios.
        </p>
      </div>
    );
  }

  const branch = branches.find((b) => b.id === activeBranch);
  const days = daySchedules[activeBranch] ?? [];

  function updateDay(dayOfWeek: number, field: keyof DaySchedule, value: string | boolean) {
    setDaySchedules((prev) => ({
      ...prev,
      [activeBranch]: (prev[activeBranch] ?? []).map((d) =>
        d.day_of_week === dayOfWeek ? { ...d, [field]: value } : d
      ),
    }));
    setSavedMsg(null);
  }

  function handleSave() {
    setSavedMsg(null);
    startTransition(async () => {
      await saveSchedules(activeBranch, orgId, daySchedules[activeBranch] ?? []);
      setSavedMsg('Horarios guardados');
      router.refresh();
    });
  }

  function handleTemporaryClosed(branchId: string, closed: boolean) {
    startTransition(async () => {
      await toggleTemporarilyClosed(branchId, closed);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Branch tabs */}
      {branches.length > 1 && (
        <div role="tablist" aria-label="Sucursales" className="flex gap-1 rounded-lg border border-rule bg-cream p-1">
          {branches.map((b) => (
            <button
              key={b.id}
              role="tab"
              aria-selected={activeBranch === b.id}
              onClick={() => { setActiveBranch(b.id); setSavedMsg(null); }}
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

      {/* Temporarily closed toggle */}
      {branch && (
        <div className="flex items-center justify-between rounded-xl border border-rule bg-card px-4 py-3">
          <div>
            <p className="text-sm font-sans font-medium text-ink">Cerrado temporalmente</p>
            <p className="text-xs font-sans text-muted">
              El menú mostrará un mensaje de cierre hasta que lo desactives.
            </p>
          </div>
          <Switch
            checked={branch.is_temporarily_closed}
            onCheckedChange={(v) => handleTemporaryClosed(branch.id, v)}
            aria-label="Cierre temporal"
          />
        </div>
      )}

      {/* Schedule table */}
      <div className="overflow-hidden rounded-xl border border-rule">
        <table className="w-full text-sm font-sans">
          <thead className="border-b border-rule bg-cream">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-medium text-muted">Día</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-muted">Abre</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-muted">Cierra</th>
              <th scope="col" className="px-4 py-3 text-center font-medium text-muted">Abierto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule bg-card">
            {days.map((day) => {
              const dayLabel = DAYS.find((d) => d.value === day.day_of_week)?.label ?? '';
              return (
                <tr key={day.day_of_week} className={cn(!day.is_open && 'opacity-50')}>
                  <td className="px-4 py-2 font-medium text-ink">{dayLabel}</td>
                  <td className="px-4 py-2">
                    <input
                      type="time"
                      value={day.opens_at}
                      onChange={(e) => updateDay(day.day_of_week, 'opens_at', e.target.value)}
                      disabled={!day.is_open}
                      className="h-8 rounded-md border border-rule bg-cream px-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed"
                      aria-label={`${dayLabel}: hora de apertura`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="time"
                      value={day.closes_at}
                      onChange={(e) => updateDay(day.day_of_week, 'closes_at', e.target.value)}
                      disabled={!day.is_open}
                      className="h-8 rounded-md border border-rule bg-cream px-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed"
                      aria-label={`${dayLabel}: hora de cierre`}
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Switch
                      checked={day.is_open}
                      onCheckedChange={(v) => updateDay(day.day_of_week, 'is_open', v)}
                      aria-label={`${dayLabel}: ${day.is_open ? 'abierto' : 'cerrado'}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar horarios'}
        </Button>
        {savedMsg && (
          <p role="status" className="text-sm font-sans text-green">{savedMsg}</p>
        )}
      </div>
    </div>
  );
}
