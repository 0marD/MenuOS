'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@menuos/ui';

const SETTINGS_NAV = [
  { label: 'Marca', href: '/settings/brand' },
  { label: 'Sucursales', href: '/settings/branches' },
  { label: 'Horarios', href: '/settings/schedules' },
  { label: 'Equipo', href: '/settings/team' },
  { label: 'Plantillas WA', href: '/settings/templates' },
  { label: 'Integraciones', href: '/settings/integrations' },
  { label: 'Facturación', href: '/settings/billing' },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex shrink-0 gap-1 overflow-x-auto lg:w-44 lg:flex-col"
      aria-label="Opciones de configuración"
    >
      {SETTINGS_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
          className={cn(
            'whitespace-nowrap rounded px-3 py-2 text-sm font-medium transition-colors',
            pathname.startsWith(item.href)
              ? 'bg-accent/10 text-accent'
              : 'text-muted hover:bg-cream hover:text-ink',
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
