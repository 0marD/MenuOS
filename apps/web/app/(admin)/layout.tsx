import { redirect } from 'next/navigation';
import { AuthProvider } from '@/lib/auth/auth-context';
import { requireAdminSession } from '@/lib/auth/get-session';
import { AdminHeader } from './components/AdminHeader';
import { AdminSidebar } from './components/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let session;
  try {
    session = await requireAdminSession();
  } catch {
    redirect('/auth/login');
  }

  const { staffUser, org } = session;

  return (
    <AuthProvider value={{ staffUser, org }}>
      <div className="flex h-screen overflow-hidden bg-paper">
        <aside className="hidden w-64 shrink-0 border-r border-rule lg:flex lg:flex-col">
          <AdminSidebar staffUser={staffUser} org={org} />
        </aside>
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="shrink-0 border-b border-rule bg-paper">
            <AdminHeader staffUser={staffUser} org={org} />
          </header>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
