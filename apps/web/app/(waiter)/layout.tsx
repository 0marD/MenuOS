import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ReactNode } from 'react';
import { PushSubscriber } from '@/components/PushSubscriber';

export default async function WaiterLayout({ children }: { children: ReactNode }) {
  const jar = await cookies();
  const staffId = jar.get('menuos_staff_id')?.value;
  const branchId = jar.get('menuos_branch_id')?.value;

  if (!staffId || !branchId) redirect('/auth/pin');

  // Verify staff record is still active
  const supabase = await createClient();
  const { data: staff } = await supabase
    .from('staff_users')
    .select('id, role, is_active')
    .eq('id', staffId)
    .eq('is_active', true)
    .single();

  if (!staff || !['waiter', 'manager', 'super_admin'].includes(staff.role)) {
    redirect('/auth/pin');
  }

  return (
    <>
      <PushSubscriber />
      {children}
    </>
  );
}
