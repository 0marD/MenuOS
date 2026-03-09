'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  MessageCircle,
  Settings,
  QrCode,
  ShoppingBag,
  Gift,
  Grid3x3,
} from 'lucide-react';
import { cn } from '@menuos/ui';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/menu', label: 'Menú', icon: UtensilsCrossed },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/orders/tables', label: 'Mesas', icon: Grid3x3 },
  { href: '/admin/crm', label: 'Clientes', icon: Users },
  { href: '/admin/campaigns', label: 'Campañas', icon: MessageCircle },
  { href: '/admin/loyalty', label: 'Fidelidad', icon: Gift },
  { href: '/admin/qr', label: 'Código QR', icon: QrCode },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="hidden w-56 shrink-0 flex-col border-r border-rule bg-cream md:flex"
    >
      <div className="flex h-14 items-center border-b border-rule px-4">
        <span className="font-display text-lg font-bold text-ink">MenuOS</span>
      </div>
      <ul className="flex flex-1 flex-col gap-0.5 p-2" role="list">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-sans transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-foreground hover:bg-paper'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
