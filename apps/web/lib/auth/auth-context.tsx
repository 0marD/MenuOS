'use client';

import { createContext, useContext } from 'react';
import type { StaffUser, Organization } from './get-session';

export interface AuthContextValue {
  staffUser: StaffUser;
  org: Organization;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AuthContextValue;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
