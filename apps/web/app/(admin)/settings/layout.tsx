import { type ReactNode } from 'react';
import { SettingsNav } from './SettingsNav';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="p-4 lg:p-6">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Configuración</h1>
      <div className="flex flex-col gap-6 lg:flex-row">
        <SettingsNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
