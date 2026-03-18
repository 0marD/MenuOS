import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@menuos/database';

export type StaffUser = Tables<'staff_users'>;
export type Organization = Tables<'organizations'>;

export interface AuthSession {
  authId: string;
  staffUser: StaffUser;
  org: Organization;
}

export async function getSession(): Promise<AuthSession | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('*')
    .eq('auth_id', user.id)
    .eq('is_active', true)
    .single();

  if (!staffUser) return null;

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', staffUser.organization_id)
    .single();

  if (!org) return null;

  return { authId: user.id, staffUser, org };
}

export async function requireAuthSession(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}

export async function requireAdminSession(): Promise<AuthSession> {
  const session = await requireAuthSession();
  if (!['super_admin', 'manager'].includes(session.staffUser.role)) {
    throw new Error('Forbidden');
  }
  return session;
}
