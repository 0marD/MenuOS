'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { verifyPin } from './hash-pin';

export async function loginWithPin(data: { pin: string; branchId: string }) {
  const supabase = await createClient();

  const { data: staffUsers } = await supabase
    .from('staff_users')
    .select('*')
    .contains('branch_ids', [data.branchId])
    .in('role', ['waiter', 'kitchen'])
    .eq('is_active', true)
    .not('pin_hash', 'is', null);

  if (!staffUsers || staffUsers.length === 0) {
    return { error: 'PIN incorrecto.' };
  }

  let matchedUser = null;
  for (const user of staffUsers) {
    if (user.pin_hash && (await verifyPin(data.pin, user.pin_hash))) {
      matchedUser = user;
      break;
    }
  }

  if (!matchedUser) {
    return { error: 'PIN incorrecto.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('menuos_staff_id', matchedUser.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 12, // 12 hours
    path: '/',
  });
  cookieStore.set('menuos_branch_id', data.branchId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 12,
    path: '/',
  });

  if (matchedUser.role === 'kitchen') {
    redirect('/kitchen');
  } else {
    redirect('/waiter');
  }
}

export async function logoutPin() {
  const cookieStore = await cookies();
  cookieStore.delete('menuos_staff_id');
  cookieStore.delete('menuos_branch_id');
  redirect('/auth/pin');
}
