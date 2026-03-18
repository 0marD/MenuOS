'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@menuos/database';

type Table = Tables<'restaurant_tables'>;
type Order = Pick<Tables<'orders'>, 'id' | 'table_id' | 'status'>;

interface TableMapProps {
  tables: Table[];
  initialOrders: Order[];
  branchId: string;
}

const STATUS_COLOR: Record<string, string> = {
  free: 'bg-cream border-rule text-muted',
  pending: 'bg-amber-50 border-amber-400 text-amber-800',
  confirmed: 'bg-blue-50 border-blue-400 text-blue-800',
  preparing: 'bg-orange-50 border-orange-400 text-orange-800',
  ready: 'bg-green-50 border-green-500 text-green-800',
};

const STATUS_LABEL: Record<string, string> = {
  free: 'Libre',
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: '✅ Listo',
};

function getTableStatus(tableId: string, orders: Order[]): string {
  const active = orders.filter(
    (o) => o.table_id === tableId && !['delivered', 'cancelled'].includes(o.status),
  );
  if (active.length === 0) return 'free';
  // Return highest-priority status
  const priority = ['ready', 'preparing', 'confirmed', 'pending'];
  for (const s of priority) {
    if (active.some((o) => o.status === s)) return s;
  }
  return 'pending';
}

export function TableMap({ tables, initialOrders, branchId }: TableMapProps) {
  const [orders] = useState(initialOrders);
  const router = useRouter();
  const refresh = useCallback(() => router.refresh(), [router]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`tablemap:${branchId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `branch_id=eq.${branchId}` },
        () => refresh(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [branchId, refresh]);

  if (tables.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">
        No hay mesas configuradas para esta sucursal.
      </p>
    );
  }

  // Group by zone
  const zones = new Map<string, Table[]>();
  for (const table of tables) {
    const zone = table.zone ?? 'General';
    const list = zones.get(zone) ?? [];
    list.push(table);
    zones.set(zone, list);
  }

  return (
    <div className="flex flex-col gap-6">
      {Array.from(zones.entries()).map(([zone, zoneTables]) => (
        <section key={zone}>
          {zones.size > 1 && (
            <h3 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">
              {zone}
            </h3>
          )}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {zoneTables.map((table) => {
              const status = getTableStatus(table.id, orders);
              return (
                <div
                  key={table.id}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 text-center transition-colors ${STATUS_COLOR[status] ?? STATUS_COLOR.free}`}
                >
                  <span className="font-display text-lg font-bold leading-none">{table.name}</span>
                  <span className="mt-1 text-[10px] font-medium">{STATUS_LABEL[status]}</span>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_LABEL).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5 text-xs text-muted">
            <span className={`inline-block h-3 w-3 rounded-full border ${STATUS_COLOR[key]}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
