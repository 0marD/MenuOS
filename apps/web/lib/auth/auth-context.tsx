'use client';

import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@menuos/shared/constants';

export interface StaffUser {
  id: string;
  auth_user_id: string;
  organization_id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthOrg {
  id: string;
  name: string;
  slug: string;
  plan: 'starter' | 'pro' | 'business';
  logo_url: string | null;
}

interface AuthContextValue {
  user: User;
  staffUser: StaffUser;
  org: AuthOrg;
  role: UserRole;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  value,
  children,
}: {
  value: AuthContextValue;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
