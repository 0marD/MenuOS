import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ReactNode } from 'react';
import { PushSubscriber } from '@/components/PushSubscriber';

export default async function KitchenLayout({ children }: { children: ReactNode }) {
  const jar = await cookies();
  const staffId = jar.get('menuos_staff_id')?.value;

  if (!staffId) redirect('/auth/pin');

  const supabase = await createClient();
  const { data: staff } = await supabase
    .from('staff_users')
    .select('id, role, is_active')
    .eq('id', staffId)
    .eq('is_active', true)
    .single();

  if (!staff || !['kitchen', 'manager', 'super_admin'].includes(staff.role)) {
    redirect('/auth/pin');
  }

  return (
    <>
      <PushSubscriber />
      {children}
    </>
  );
}
