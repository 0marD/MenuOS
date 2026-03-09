import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Equipo — Configuración' };
export default function TeamPage() {
  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Equipo</h2>
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-rule py-16 text-center">
        <p className="text-sm font-sans text-muted">Gestión de equipo — próximamente</p>
      </div>
    </div>
  );
}
