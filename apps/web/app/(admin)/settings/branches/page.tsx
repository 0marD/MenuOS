import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Sucursales — Configuración' };
export default function BranchesPage() {
  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Sucursales</h2>
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-rule py-16 text-center">
        <p className="text-sm font-sans text-muted">Gestión de sucursales — próximamente</p>
      </div>
    </div>
  );
}
