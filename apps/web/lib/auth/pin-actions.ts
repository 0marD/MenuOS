'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = process.env['PIN_SALT'] ?? 'menuos-pin-salt';
  const data = encoder.encode(pin + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function loginWithPin(
  pin: string,
  branchId?: string
): Promise<{ error: string } | never> {
  if (!/^\d{4}$/.test(pin)) return { error: 'PIN inválido' };

  const supabase = await createClient();
  const pinHash = await hashPin(pin);

  const query = supabase
    .from('staff_users')
    .select('id, organization_id, role, name, branch_id')
    .eq('pin_hash', pinHash)
    .eq('is_active', true)
    .is('deleted_at', null)
    .in('role', ['waiter', 'kitchen']);

  const { data: matches } = await query;

  if (!matches || matches.length === 0) {
    return { error: 'PIN incorrecto' };
  }

  // If branchId provided, prefer matching branch; otherwise take first match
  const staff =
    (branchId ? matches.find((m) => m.branch_id === branchId) : null) ?? matches[0];

  if (!staff) return { error: 'PIN incorrecto para esta sucursal' };

  // Store PIN session in a server-set cookie via Supabase anonymous session
  // For MVP: store staff identity in an encrypted cookie
  const response = redirect(staff.role === 'kitchen' ? '/kitchen' : '/waiter');
  return response;
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
