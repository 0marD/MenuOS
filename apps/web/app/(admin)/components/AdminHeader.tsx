'use client';

import { Menu } from 'lucide-react';
import { useState } from 'react';
import type { StaffUser, Organization } from '@/lib/auth/get-session';
import { AdminSidebar } from './AdminSidebar';

interface AdminHeaderProps {
  title?: string;
  staffUser: StaffUser;
  org: Organization;
}

export function AdminHeader({ title, staffUser, org }: AdminHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            className="rounded p-1.5 text-muted hover:bg-cream transition-colors lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          {title && (
            <h1 className="font-display text-xl font-bold text-ink">{title}</h1>
          )}
        </div>
        <p className="hidden font-mono text-xs uppercase tracking-widest text-muted lg:block">
          {org.name}
        </p>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 shadow-xl">
            <AdminSidebar staffUser={staffUser} org={org} />
          </div>
        </div>
      )}
    </>
  );
}
