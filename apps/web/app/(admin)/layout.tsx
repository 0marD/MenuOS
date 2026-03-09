import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasPermission, type UserRole } from '@menuos/shared/constants';
import { AuthProvider, type StaffUser, type AuthOrg } from '@/lib/auth/auth-context';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('id, auth_user_id, organization_id, name, email, role')
    .eq('auth_user_id', user.id)
    .is('deleted_at', null)
    .single();

  if (!staffUser) redirect('/auth/login');

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, slug, plan, logo_url')
    .eq('id', staffUser.organization_id)
    .single();

  if (!org) redirect('/auth/login');

  const typedStaff: StaffUser = {
    id: staffUser.id,
    auth_user_id: staffUser.auth_user_id ?? '',
    organization_id: staffUser.organization_id,
    name: staffUser.name,
    email: staffUser.email ?? '',
    role: staffUser.role as UserRole,
  };

  const typedOrg: AuthOrg = {
    id: org.id,
    name: org.name,
    slug: org.slug,
    plan: org.plan as AuthOrg['plan'],
    logo_url: org.logo_url,
  };

  return (
    <AuthProvider
      value={{
        user,
        staffUser: typedStaff,
        org: typedOrg,
        role: typedStaff.role,
        can: (permission) => hasPermission(typedStaff.role, permission),
      }}
    >
      <div className="flex h-screen overflow-hidden bg-paper">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader user={user} staffName={staffUser.name} />
          <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
