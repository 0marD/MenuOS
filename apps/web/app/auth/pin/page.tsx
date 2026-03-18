import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PinLoginForm } from './PinLoginForm';

export const metadata: Metadata = { title: 'Acceso con PIN' };

export default async function PinPage() {
  const supabase = await createClient();

  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-4">
      <div className="w-full max-w-xs">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-black text-paper">MenuOS</h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
            Acceso Staff
          </p>
        </div>

        <div className="rounded border border-rule/20 bg-ink/60 p-6">
          <h2 className="mb-6 text-center font-display text-xl font-bold text-paper">
            Ingresa tu PIN
          </h2>
          <PinLoginForm branches={branches ?? []} />
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="font-mono text-xs uppercase tracking-widest text-muted hover:text-paper transition-colors"
          >
            ← Acceso admin
          </Link>
        </p>
      </div>
    </div>
  );
}
