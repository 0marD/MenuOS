import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Iniciar sesi\u00f3n \u2014 MenuOS',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-ink">MenuOS</h1>
          <p className="mt-1 text-sm font-sans text-muted">Inicia sesi\u00f3n en tu cuenta</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
