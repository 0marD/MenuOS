import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Configuración — MenuOS Admin' };

const settingsNav = [
  { href: '/admin/settings/brand', label: 'Marca' },
  { href: '/admin/settings/branches', label: 'Sucursales' },
  { href: '/admin/settings/team', label: 'Equipo' },
  { href: '/admin/settings/schedules', label: 'Horarios' },
  { href: '/admin/settings/billing', label: 'Facturación' },
] as const;

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold text-ink">Configuración</h1>
      <div className="flex gap-6">
        <nav aria-label="Configuración" className="w-40 shrink-0">
          <ul className="flex flex-col gap-0.5" role="list">
            {settingsNav.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded-md px-3 py-2 text-sm font-sans text-foreground hover:bg-cream"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
