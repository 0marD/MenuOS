'use client';

import type { User } from '@supabase/supabase-js';
import { LogOut } from 'lucide-react';
import { Button } from '@menuos/ui/atoms/Button';
import { Avatar, AvatarFallback } from '@menuos/ui/atoms/Avatar';
import { logout } from '@/lib/auth/actions';

interface AdminHeaderProps {
  user: User;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const initials = (user.email ?? 'U')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="flex h-14 items-center justify-between border-b border-rule bg-cream px-4">
      <div className="md:hidden">
        <span className="font-display text-lg font-bold text-ink">MenuOS</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden text-xs font-sans text-muted md:block">{user.email}</span>
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label="Cerrar sesión"
            className="h-8 w-8"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>
      </div>
    </header>
  );
}
