import type { Metadata } from 'next';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import { BranchManager } from './BranchManager';

export const metadata: Metadata = { title: 'Sucursales' };

export default async function BranchesPage() {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { data: branches } = await supabase
    .from('branches')
    .select('*')
    .eq('organization_id', org.id)
    .order('created_at');

  return <BranchManager branches={branches ?? []} />;
}
