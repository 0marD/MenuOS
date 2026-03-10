'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hashPin } from './hash-pin';

export async function loginWithPin(
  pin: string,
  branchId?: string
): Promise<{ error: string } | never> {
  if (!/^\d{4}$/.test(pin)) return { error: 'PIN inválido' };

  let pinHash: string;
  try {
    pinHash = await hashPin(pin);
  } catch {
    return { error: 'Error de configuración del servidor' };
  }

  const supabase = await createClient();

  const { data: matches } = await supabase
    .from('staff_users')
    .select('id, organization_id, role, name, branch_id')
    .eq('pin_hash', pinHash)
    .eq('is_active', true)
    .is('deleted_at', null)
    .in('role', ['waiter', 'kitchen']);

  if (!matches || matches.length === 0) {
    return { error: 'PIN incorrecto' };
  }

  const staff =
    (branchId ? matches.find((m) => m.branch_id === branchId) : null) ?? matches[0];

  if (!staff) return { error: 'PIN incorrecto para esta sucursal' };

  redirect(staff.role === 'kitchen' ? '/kitchen' : '/waiter');
}

export async function getPinBranches(): Promise<Array<{ id: string; name: string }>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('branches')
    .select('id, name')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('name');
  return data ?? [];
}
