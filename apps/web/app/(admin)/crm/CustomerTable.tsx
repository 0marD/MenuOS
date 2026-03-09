'use client';

import { useState, useMemo } from 'react';
import { Search, Download } from 'lucide-react';
import { Badge } from '@menuos/ui/atoms/Badge';
import { Button } from '@menuos/ui/atoms/Button';
import { cn } from '@menuos/ui';
import { CUSTOMER_SEGMENTS } from '@menuos/shared/constants';

interface Customer {
  id: string;
  name: string;
  phone_last4: string;
  segment: string;
  visit_count: number;
  last_visit_at: string | null;
  is_opted_in: boolean;
  created_at: string;
}

interface CustomerTableProps {
  customers: Customer[];
}

const SEGMENT_LABELS: Record<string, string> = {
  new: 'Nuevo',
  frequent: 'Frecuente',
  dormant: 'Dormido',
};

const SEGMENT_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  new: 'secondary',
  frequent: 'default',
  dormant: 'outline',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        !search.trim() || c.name.toLowerCase().includes(search.toLowerCase());
      const matchesSegment = segmentFilter === 'all' || c.segment === segmentFilter;
      return matchesSearch && matchesSegment;
    });
  }, [customers, search, segmentFilter]);

  function exportCsv() {
    const header = 'Nombre,Teléfono (últimos 4),Segmento,Visitas,Última visita,Registrado,Acepta marketing';
    const rows = filtered.map((c) =>
      [
        `"${c.name}"`,
        `***${c.phone_last4}`,
        SEGMENT_LABELS[c.segment] ?? c.segment,
        c.visit_count,
        formatDate(c.last_visit_at),
        formatDate(c.created_at),
        c.is_opted_in ? 'Sí' : 'No',
      ].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-rule bg-card pl-9 pr-3 text-sm font-sans placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent sm:w-64"
            aria-label="Buscar clientes"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Segment filter tabs */}
          <div
            role="group"
            aria-label="Filtrar por segmento"
            className="flex rounded-md border border-rule bg-cream text-sm font-sans overflow-hidden"
          >
            {[
              { value: 'all', label: 'Todos' },
              { value: 'new', label: 'Nuevos' },
              { value: 'frequent', label: 'Frecuentes' },
              { value: 'dormant', label: 'Dormidos' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSegmentFilter(value)}
                aria-pressed={segmentFilter === value}
                className={cn(
                  'px-3 py-1.5 transition-colors',
                  segmentFilter === value
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-foreground hover:bg-paper'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            aria-label="Exportar CSV"
          >
            <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
            CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-rule py-16 text-center">
          <p className="text-sm font-sans text-muted">
            {customers.length === 0
              ? 'Aún no hay clientes registrados'
              : 'Sin resultados para esta búsqueda'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-rule">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead className="border-b border-rule bg-cream">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-muted">
                    Nombre
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-muted">
                    Teléfono
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-muted">
                    Segmento
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium text-muted">
                    Visitas
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-muted">
                    Última visita
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-muted">
                    Registrado
                  </th>
                  <th scope="col" className="px-4 py-3 text-center font-medium text-muted">
                    Marketing
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule bg-card">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">{customer.name}</td>
                    <td className="px-4 py-3 font-mono text-muted">
                      ***{customer.phone_last4}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={SEGMENT_VARIANTS[customer.segment] ?? 'outline'}>
                        {SEGMENT_LABELS[customer.segment] ?? customer.segment}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink">
                      {customer.visit_count}
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(customer.last_visit_at)}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(customer.created_at)}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        aria-label={customer.is_opted_in ? 'Acepta marketing' : 'No acepta marketing'}
                        className={cn(
                          'inline-block h-2 w-2 rounded-full',
                          customer.is_opted_in ? 'bg-green' : 'bg-rule'
                        )}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-rule bg-cream px-4 py-2 text-xs font-sans text-muted">
            {filtered.length} de {customers.length} clientes
          </div>
        </div>
      )}
    </div>
  );
}
