import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from './RegisterForm';

export const metadata: Metadata = { title: 'Crear cuenta' };

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-black text-ink">MenuOS</h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
            Sistema operativo para restaurantes
          </p>
        </div>

        <div className="rounded border border-rule bg-paper p-6 shadow-sm">
          <h2 className="mb-6 font-display text-xl font-bold text-ink">Crear cuenta</h2>
          <RegisterForm />

          <p className="mt-4 text-center text-sm text-muted">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="font-medium text-accent hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
