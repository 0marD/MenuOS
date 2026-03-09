import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function WaiterLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Waiter/kitchen use PIN auth — for MVP we check if user has a valid session
  // In production this would validate a PIN session cookie
  if (!user) redirect('/auth/pin');

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('id, name, role, organization_id, branch_id')
    .eq('auth_user_id', user.id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single();

  if (!staffUser || !['waiter', 'manager', 'super_admin'].includes(staffUser.role ?? '')) {
    redirect('/auth/pin');
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink text-paper">
      <header className="flex h-12 items-center justify-between border-b border-white/10 px-4">
        <span className="font-display text-base font-bold">MenuOS · Mesero</span>
        <div className="flex items-center gap-2">
          <a href="/waiter" className="rounded-md px-2 py-1 text-xs font-sans text-white/60 hover:bg-white/10">Pedidos</a>
          <a href="/waiter/stamp" className="rounded-md px-2 py-1 text-xs font-sans text-white/60 hover:bg-white/10">Sellos</a>
          <span className="text-xs font-sans text-white/40">{staffUser.name}</span>
          <a href="/auth/pin" className="rounded-md px-2 py-1 text-xs font-sans text-white/60 hover:bg-white/10">Salir</a>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
