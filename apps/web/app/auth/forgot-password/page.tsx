import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Recuperar contrase\u00f1a \u2014 MenuOS',
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-ink">MenuOS</h1>
          <p className="mt-1 text-sm font-sans text-muted">Recupera tu contrase\u00f1a</p>
        </div>
        <div className="rounded-lg border border-rule bg-card p-6 text-center">
          <p className="text-sm font-sans text-muted">Recuperaci\u00f3n pr\u00f3ximamente disponible</p>
          <p className="mt-4 text-xs font-sans text-muted">
            <Link href="/auth/login" className="text-accent hover:underline">
              \u2190 Volver al inicio de sesi\u00f3n
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
