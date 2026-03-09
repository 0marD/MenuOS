import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function KitchenLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/pin');

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('id, name, role, organization_id, branch_id')
    .eq('auth_user_id', user.id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single();

  if (!staffUser || !['kitchen', 'manager', 'super_admin'].includes(staffUser.role ?? '')) {
    redirect('/auth/pin');
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <header className="flex h-10 items-center justify-between border-b border-white/10 px-4">
        <span className="font-mono text-sm font-bold tracking-wider text-white/70 uppercase">
          KDS · Cocina
        </span>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green" title="Conectado" />
          <span className="text-xs font-mono text-white/40">{staffUser.name}</span>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
