import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Configuración — MenuOS Admin' };

export default function SettingsPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Configuración</h1>
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-rule py-20 text-center">
        <p className="text-sm font-sans text-muted">Configuración de la cuenta</p>
      </div>
    </div>
  );
}
