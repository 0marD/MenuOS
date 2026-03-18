import { cookies } from 'next/headers';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StampGrantForm } from './StampGrantForm';

export default async function StampPage() {
  const jar = await cookies();
  const branchId = jar.get('menuos_branch_id')!.value;
  const supabase = await createClient();

  const { data: branch } = await supabase
    .from('branches')
    .select('organization_id')
    .eq('id', branchId)
    .single();

  if (!branch) return null;

  const { data: programs } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('organization_id', branch.organization_id)
    .eq('is_active', true);

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-10 border-b border-rule bg-paper px-4 py-3">
        <Link href="/waiter" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ChevronLeft className="h-4 w-4" />
          Volver
        </Link>
        <h1 className="mt-1 font-display text-lg font-bold text-ink">Sellos de fidelización</h1>
      </header>
      <main className="p-4">
        {(!programs || programs.length === 0) ? (
          <p className="py-12 text-center text-sm text-muted">
            No hay programas de fidelización activos.
          </p>
        ) : (
          <StampGrantForm programs={programs} orgId={branch.organization_id} />
        )}
      </main>
    </div>
  );
}
