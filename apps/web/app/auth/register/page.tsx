import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Crear cuenta \u2014 MenuOS',
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-ink">MenuOS</h1>
          <p className="mt-1 text-sm font-sans text-muted">Crea tu cuenta de restaurante</p>
        </div>
        <div className="rounded-lg border border-rule bg-card p-6 text-center">
          <p className="text-sm font-sans text-muted">Registro pr\u00f3ximamente disponible</p>
          <p className="mt-4 text-xs font-sans text-muted">
            \u00bfYa tienes cuenta?{' '}
            <Link href="/auth/login" className="text-accent hover:underline">
              Inicia sesi\u00f3n
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
