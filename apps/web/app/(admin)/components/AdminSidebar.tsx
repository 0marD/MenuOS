'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Building2,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plug,
  QrCode,
  Settings,
  ShoppingBag,
  Star,
  Users,
} from 'lucide-react';
import { cn } from '@menuos/ui';
import { logout } from '@/lib/auth/actions';
import type { StaffUser, Organization } from '@/lib/auth/get-session';

interface NavChild {
  label: string;
  href: string;
  superAdminOnly?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: NavChild[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Menú', href: '/menu', icon: BookOpen },
  { label: 'Clientes', href: '/crm', icon: Users },
  { label: 'Campañas WA', href: '/campaigns', icon: MessageSquare },
  { label: 'Pedidos', href: '/orders', icon: ShoppingBag },
  { label: 'Fidelización', href: '/loyalty', icon: Star },
  { label: 'Código QR', href: '/qr', icon: QrCode },
  {
    label: 'Configuración',
    href: '/settings',
    icon: Settings,
    children: [
      { label: 'Marca', href: '/settings/brand' },
      { label: 'Sucursales', href: '/settings/branches' },
      { label: 'Horarios', href: '/settings/schedules' },
      { label: 'Equipo', href: '/settings/team' },
      { label: 'Integraciones', href: '/settings/integrations' },
      { label: 'Facturación', href: '/settings/billing', superAdminOnly: true },
    ],
  },
] as const;

interface AdminSidebarProps {
  staffUser: StaffUser;
  org: Organization;
}

export function AdminSidebar({ staffUser, org }: AdminSidebarProps) {
  const pathname = usePathname();
  const isSuperAdmin = staffUser.role === 'super_admin';

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <nav className="flex h-full flex-col bg-paper" aria-label="Navegación principal">
      <div className="border-b border-rule px-5 py-4">
        <p className="font-display text-lg font-bold text-ink leading-tight">{org.name}</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted capitalize">
          {org.plan}
        </p>
      </div>

      <ul className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            {item.children ? (
              <details className="group" open={pathname.startsWith(item.href)}>
                <summary className={cn(
                  'flex cursor-pointer list-none items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-cream hover:text-ink',
                  pathname.startsWith(item.href) ? 'text-ink' : 'text-muted',
                )}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="ml-7 mt-0.5 space-y-0.5">
                  {item.children
                    .filter((child) => !child.superAdminOnly || isSuperAdmin)
                    .map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className={cn(
                          'block rounded px-3 py-1.5 text-sm transition-colors',
                          isActive(child.href)
                            ? 'bg-accent/10 font-medium text-accent'
                            : 'text-muted hover:bg-cream hover:text-ink',
                        )}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:bg-cream hover:text-ink',
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>

      <div className="border-t border-rule px-3 py-3">
        <div className="mb-2 flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream font-mono text-xs text-muted uppercase">
            {staffUser.name.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{staffUser.name}</p>
            <p className="font-mono text-[10px] capitalize text-muted">{staffUser.role.replace('_', ' ')}</p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-muted transition-colors hover:bg-cream hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </nav>
  );
}
