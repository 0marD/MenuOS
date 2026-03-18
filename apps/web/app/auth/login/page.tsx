import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = { title: 'Iniciar sesión' };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-black text-ink">MenuOS</h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
            Panel de Control
          </p>
        </div>

        <div className="rounded border border-rule bg-paper p-6 shadow-sm">
          <h2 className="mb-6 font-display text-xl font-bold text-ink">Iniciar sesión</h2>
          <LoginForm />

          <div className="mt-4 flex flex-col gap-2 text-center text-sm">
            <Link href="/auth/forgot-password" className="text-muted hover:text-accent transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
            <span className="text-muted">
              ¿No tienes cuenta?{' '}
              <Link href="/auth/register" className="font-medium text-accent hover:underline">
                Regístrate
              </Link>
            </span>
          </div>
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/auth/pin"
            className="font-mono text-xs uppercase tracking-widest text-muted hover:text-accent transition-colors"
          >
            Acceso mesero / cocina →
          </Link>
        </p>
      </div>
    </div>
  );
}
