'use server';

import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@menuos/shared/constants';

export interface AuthSession {
  userId: string;
  orgId: string;
  role: UserRole;
}

/**
 * Validates the current server session and returns org + role.
 * Throws if the user is not authenticated or has no staff record.
 * Use this at the start of every sensitive server action.
 */
export async function requireAuthSession(): Promise<AuthSession> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: staffUser, error: staffError } = await supabase
    .from('staff_users')
    .select('organization_id, role')
    .eq('auth_user_id', user.id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single();

  if (staffError || !staffUser) {
    throw new Error('Unauthorized');
  }

  return {
    userId: user.id,
    orgId: staffUser.organization_id,
    role: staffUser.role as UserRole,
  };
}

/**
 * Like requireAuthSession but also asserts the caller belongs to the expected org.
 * Prevents privilege escalation via org ID manipulation.
 */
export async function requireOrgSession(expectedOrgId: string): Promise<AuthSession> {
  const session = await requireAuthSession();

  if (session.orgId !== expectedOrgId) {
    throw new Error('Forbidden');
  }

  return session;
}
