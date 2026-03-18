'use client';

import { Download, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button } from '@menuos/ui';
import type { Tables } from '@menuos/database';

type Customer = Tables<'customers'>;

const SEGMENT_LABELS: Record<string, string> = {
  new: 'Nuevo',
  frequent: 'Frecuente',
  dormant: 'Dormido',
};

const SEGMENT_VARIANTS: Record<string, 'default' | 'info' | 'success' | 'warning' | 'muted'> = {
  new: 'info',
  frequent: 'success',
  dormant: 'muted',
} as const;

interface CustomerTableProps {
  customers: Customer[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState<string>('all');

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase());
      const matchesSegment = segment === 'all' || c.segment === segment;
      return matchesSearch && matchesSegment;
    });
  }, [customers, search, segment]);

  function exportCsv() {
    const rows = [
      ['Nombre', 'Segmento', 'Visitas', 'Opt-in marketing', 'Registro'].join(','),
      ...filtered.map((c) =>
        [
          `"${c.name}"`,
          c.segment,
          c.visit_count,
          c.opt_in_marketing ? 'Sí' : 'No',
          new Date(c.created_at).toLocaleDateString('es-MX'),
        ].join(','),
      ),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Buscar cliente…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-rule bg-paper py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex gap-1.5">
          {['all', 'new', 'frequent', 'dormant'].map((s) => (
            <button
              key={s}
              onClick={() => setSegment(s)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                segment === s
                  ? 'bg-accent/10 text-accent'
                  : 'bg-cream text-muted hover:bg-rule hover:text-ink'
              }`}
            >
              {s === 'all' ? 'Todos' : SEGMENT_LABELS[s]}
            </button>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={exportCsv} className="ml-auto gap-1.5">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted">
        <span>
          <strong className="text-ink">{filtered.length}</strong> clientes
        </span>
        <span>
          <strong className="text-ink">{customers.filter((c) => c.opt_in_marketing).length}</strong>{' '}
          con opt-in
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No hay clientes que mostrar.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-rule">
          <table className="w-full text-sm">
            <thead className="border-b border-rule bg-cream">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted">Cliente</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Segmento</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Visitas</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {filtered.map((customer) => (
                <tr key={customer.id} className="bg-paper hover:bg-cream/50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">{customer.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={SEGMENT_VARIANTS[customer.segment] ?? 'muted'}>
                      {SEGMENT_LABELS[customer.segment] ?? customer.segment}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-ink">
                    {customer.visit_count}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {new Date(customer.created_at).toLocaleDateString('es-MX')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
